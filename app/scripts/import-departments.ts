
import { config } from 'dotenv';
config();
import { prisma } from '../lib/db';
import fs from 'fs';

interface DepartmentData {
  departamento_pai_codigo: number;
  departamento_pai_sigla: string;
  departamento_pai_nome: string;
  departamento_codigo: number;
  departamento_sigla: string;
  departamento_nome: string;
  tipo_departamento: string;
}

// Mapeamento dos tipos da planilha para códigos do banco
const typeMapping: Record<string, string> = {
  'Operacional': 'OPE',
  'Especializada': 'ESP', 
  'Ensino': 'ENS',
  'Administrativo': 'ADM',
  'Reserva E Outros': 'RES'
};

// Cidades da Bahia
const bahrianCities = [
  'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 
  'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas',
  'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso', 'Eunápolis',
  'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi', 'Jacobina'
];

// DDDs da Bahia
const bahrianDDDs = ['71', '73', '74', '75', '77'];

function getRandomCity() {
  return bahrianCities[Math.floor(Math.random() * bahrianCities.length)];
}

function getRandomDDD() {
  return bahrianDDDs[Math.floor(Math.random() * bahrianDDDs.length)];
}

function generateRandomData(name: string, city: string, sigla: string) {
  const ddd = getRandomDDD();
  const phone = `(${ddd}) ${Math.floor(Math.random() * 90000000) + 10000000}`;
  
  const addresses = [
    `Rua da Paz, ${Math.floor(Math.random() * 9999) + 1}`,
    `Av. Principal, ${Math.floor(Math.random() * 9999) + 1}`,
    `Rua Central, ${Math.floor(Math.random() * 9999) + 1}`,
    `Av. da República, ${Math.floor(Math.random() * 9999) + 1}`,
    `Rua do Comércio, ${Math.floor(Math.random() * 9999) + 1}`
  ];
  
  const address = addresses[Math.floor(Math.random() * addresses.length)];
  const zipCodes = ['40000-000', '41000-000', '42000-000', '43000-000', '44000-000', '45000-000'];
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
  
  // Comandante fictício
  const commanderNames = [
    'Cel. João Silva', 'Cel. Maria Santos', 'Cel. Pedro Costa', 'Cel. Ana Oliveira',
    'Ten.-Cel. Carlos Lima', 'Ten.-Cel. Lucia Ferreira', 'Maj. Roberto Alves'
  ];
  const commander = commanderNames[Math.floor(Math.random() * commanderNames.length)];
  
  return {
    address,
    phone,
    city,
    state: 'BA',
    zipCode,
    commander,
    country: 'Brasil',
    observations: `Departamento ${sigla} - ${name}`,
    annualBudget: Math.floor(Math.random() * 5000000) + 500000, // Orçamento entre 500k e 5.5M
    createdAt: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  };
}

async function importDepartments() {
  try {
    console.log('🚀 Iniciando importação de departamentos...');
    
    // Buscar tipos de departamento e criar mapeamento código -> ID
    const departmentTypes = await prisma.departmentType.findMany();
    const typeIdMapping: Record<string, string> = {};
    departmentTypes.forEach(type => {
      typeIdMapping[type.code] = type.id;
    });
    
    console.log('🏷️ Mapeamento de tipos:');
    Object.entries(typeIdMapping).forEach(([code, id]) => {
      console.log(`- ${code} -> ${id}`);
    });
    
    // Ler dados da planilha
    const data: DepartmentData[] = JSON.parse(fs.readFileSync('./scripts/departments_data.json', 'utf8'));
    console.log(`📊 Total de registros a processar: ${data.length}`);
    
    // Extrair departamentos únicos (pais e filhos)
    const uniqueParents = new Map<number, any>();
    const uniqueChildren = new Map<number, any>();
    
    data.forEach(item => {
      // Departamento pai
      if (!uniqueParents.has(item.departamento_pai_codigo)) {
        uniqueParents.set(item.departamento_pai_codigo, {
          code: item.departamento_pai_codigo.toString(),
          name: item.departamento_pai_nome,
          sigla: item.departamento_pai_sigla,
          tipo: item.tipo_departamento // Vamos usar o tipo do filho para o pai também
        });
      }
      
      // Departamento filho
      if (!uniqueChildren.has(item.departamento_codigo)) {
        uniqueChildren.set(item.departamento_codigo, {
          code: item.departamento_codigo.toString(),
          name: item.departamento_nome,
          sigla: item.departamento_sigla,
          tipo: item.tipo_departamento,
          parentCode: item.departamento_pai_codigo.toString()
        });
      }
    });
    
    console.log(`👥 Departamentos pai únicos: ${uniqueParents.size}`);
    console.log(`👶 Departamentos filhos únicos: ${uniqueChildren.size}`);
    
    // Verificar quantos departamentos já existem
    let existingDepartments = await prisma.department.findMany({
      select: { code: true }
    });
    let existingCodes = new Set(existingDepartments.map(d => d.code));
    console.log(`📋 Departamentos já existentes: ${existingCodes.size}`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    console.log('\n🏗️ Importando departamentos pai...');
    
    // Importar departamentos pai primeiro
    for (const [code, dept] of uniqueParents) {
      if (existingCodes.has(dept.code)) {
        console.log(`⏭️ Pulando departamento pai existente: ${dept.sigla}`);
        skippedCount++;
        continue;
      }
      
      const randomData = generateRandomData(dept.name, getRandomCity(), dept.sigla);
      
      await prisma.department.create({
        data: {
          code: dept.code,
          name: dept.name,
          typeId: typeIdMapping[typeMapping[dept.tipo]] || typeIdMapping['ADM'],
          ...randomData
        }
      });
      
      console.log(`✅ Importado pai: ${dept.sigla} - ${dept.name}`);
      existingCodes.add(dept.code); // Atualizar lista de códigos existentes
      importedCount++;
    }
    
    console.log('\n👶 Importando departamentos filhos...');
    
    // Importar departamentos filhos
    for (const [code, dept] of uniqueChildren) {
      if (existingCodes.has(dept.code)) {
        console.log(`⏭️ Pulando departamento filho existente: ${dept.sigla}`);
        skippedCount++;
        continue;
      }
      
      // Buscar o ID do departamento pai
      const parentDept = await prisma.department.findUnique({
        where: { code: dept.parentCode }
      });
      
      if (!parentDept) {
        console.log(`❌ Pai não encontrado para ${dept.sigla} (pai: ${dept.parentCode})`);
        continue;
      }
      
      const randomData = generateRandomData(dept.name, getRandomCity(), dept.sigla);
      
      await prisma.department.create({
        data: {
          code: dept.code,
          name: dept.name,
          typeId: typeIdMapping[typeMapping[dept.tipo]] || typeIdMapping['ADM'],
          parentId: parentDept.id,
          ...randomData
        }
      });
      
      console.log(`✅ Importado filho: ${dept.sigla} - ${dept.name} (pai: ${parentDept.name})`);
      existingCodes.add(dept.code); // Atualizar lista de códigos existentes
      importedCount++;
    }
    
    console.log('\n🎉 Importação concluída!');
    console.log(`✅ Departamentos importados: ${importedCount}`);
    console.log(`⏭️ Departamentos pulados (já existentes): ${skippedCount}`);
    
    // Estatísticas finais
    const finalCount = await prisma.department.count();
    console.log(`📊 Total de departamentos no banco: ${finalCount}`);
    
    // Mostrar estatísticas por tipo
    console.log('\n📋 Departamentos por tipo:');
    const typeStats = await prisma.department.groupBy({
      by: ['typeId'],
      _count: true
    });
    
    for (const stat of typeStats) {
      const type = await prisma.departmentType.findUnique({
        where: { id: stat.typeId! }
      });
      console.log(`- ${type?.name || stat.typeId}: ${stat._count} departamentos`);
    }
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importDepartments();
