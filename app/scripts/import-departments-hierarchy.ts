
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface DepartamentoPai {
  codigo: string;
  sigla: string;
  nome: string;
  tipo: string;
}

interface Departamento {
  codigo: string;
  sigla: string;
  nome: string;
  tipo: string;
  pai_codigo: string;
}

interface DadosHierarquia {
  departamentos_pai: DepartamentoPai[];
  departamentos: Departamento[];
}

async function importDepartmentsHierarchy() {
  try {
    console.log('🏢 Iniciando importação da hierarquia de departamentos...');
    
    // Carregar dados do JSON
    const jsonPath = path.join(__dirname, '..', 'data', 'departamentos_hierarquia.json');
    const dados: DadosHierarquia = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log(`📊 ${dados.departamentos_pai.length} departamentos pai e ${dados.departamentos.length} departamentos total`);
    
    // Buscar tipos de departamento existentes
    const tiposDepartamento = await prisma.departmentType.findMany();
    const tiposMap = new Map<string, string>();
    tiposDepartamento.forEach(tipo => {
      tiposMap.set(tipo.name, tipo.id);
    });
    
    console.log('\n📁 Tipos de departamento disponíveis:');
    tiposDepartamento.forEach(tipo => {
      console.log(`  - ${tipo.name} (${tipo.code})`);
    });
    
    // ETAPA 1: Importar departamentos pai
    console.log('\n🏗️ ETAPA 1: Importando departamentos pai...');
    
    for (const deptPai of dados.departamentos_pai) {
      const tipoId = tiposMap.get(deptPai.tipo);
      
      if (!tipoId) {
        console.log(`⚠️ Tipo de departamento não encontrado: ${deptPai.tipo}`);
        continue;
      }
      
      await prisma.department.upsert({
        where: { code: deptPai.codigo },
        update: {
          name: deptPai.nome,
          typeId: tipoId,
          updatedAt: new Date(),
        },
        create: {
          code: deptPai.codigo,
          name: deptPai.nome,
          typeId: tipoId,
          parentId: null, // Departamentos pai não têm pai na planilha
          isActive: true,
        },
      });
      
      console.log(`✅ ${deptPai.sigla} - ${deptPai.nome}`);
    }
    
    console.log(`✅ ${dados.departamentos_pai.length} departamentos pai processados`);
    
    // ETAPA 2: Importar departamentos filhos
    console.log('\n🏗️ ETAPA 2: Importando departamentos filhos...');
    
    let sucessos = 0;
    let erros = 0;
    
    for (const dept of dados.departamentos) {
      try {
        const tipoId = tiposMap.get(dept.tipo);
        
        if (!tipoId) {
          console.log(`⚠️ Tipo de departamento não encontrado: ${dept.tipo} para ${dept.sigla}`);
          erros++;
          continue;
        }
        
        // Buscar o departamento pai
        const departamentoPai = await prisma.department.findUnique({
          where: { code: dept.pai_codigo }
        });
        
        if (!departamentoPai) {
          console.log(`⚠️ Departamento pai não encontrado: ${dept.pai_codigo} para ${dept.sigla}`);
          erros++;
          continue;
        }
        
        await prisma.department.upsert({
          where: { code: dept.codigo },
          update: {
            name: dept.nome,
            typeId: tipoId,
            parentId: departamentoPai.id,
            updatedAt: new Date(),
          },
          create: {
            code: dept.codigo,
            name: dept.nome,
            typeId: tipoId,
            parentId: departamentoPai.id,
            isActive: true,
          },
        });
        
        sucessos++;
        
        if (sucessos % 50 === 0) {
          console.log(`✅ ${sucessos} departamentos processados...`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao processar ${dept.sigla}: ${error}`);
        erros++;
      }
    }
    
    console.log(`\n✅ Importação concluída: ${sucessos} sucessos, ${erros} erros`);
    
    // ETAPA 3: Verificação final
    console.log('\n🔍 Verificação final...');
    
    const totalDepartamentos = await prisma.department.count();
    const departamentosComTipo = await prisma.department.count({
      where: { typeId: { not: null } }
    });
    const departamentosComPai = await prisma.department.count({
      where: { parentId: { not: null } }
    });
    
    console.log(`📊 Total de departamentos: ${totalDepartamentos}`);
    console.log(`📊 Departamentos com tipo: ${departamentosComTipo}`);
    console.log(`📊 Departamentos com pai: ${departamentosComPai}`);
    
    // Mostrar alguns exemplos da hierarquia
    console.log('\n📋 Exemplos da hierarquia:');
    const exemplos = await prisma.department.findMany({
      include: {
        type: true,
        parent: { include: { type: true } },
        children: { include: { type: true }, take: 3 }
      },
      take: 5
    });
    
    exemplos.forEach(dept => {
      const tipo = dept.type?.name || 'Sem tipo';
      const pai = dept.parent ? `${dept.parent.name} (${dept.parent.type?.name})` : 'Sem pai';
      const filhos = dept.children.length > 0 ? `${dept.children.length} filhos` : 'Sem filhos';
      
      console.log(`  - ${dept.name} (${tipo})`);
      console.log(`    Pai: ${pai}`);
      console.log(`    ${filhos}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importDepartmentsHierarchy();
