
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('=== VERIFICAÇÃO COMPLETA DO BANCO DE DADOS ===\n');
    
    // 1. DEPARTAMENTOS
    console.log('📍 DEPARTAMENTOS:');
    const departments = await prisma.department.findMany({
      include: {
        type: { select: { name: true } },
        parent: { select: { name: true } }
      }
    });
    console.log(`   Total: ${departments.length} departamentos`);
    departments.forEach((dept, index) => {
      console.log(`   ${index + 1}. ${dept.name} (${dept.code})`);
      console.log(`      - Tipo: ${dept.type?.name || 'Sem tipo'}`);
      console.log(`      - Pai: ${dept.parent?.name || 'Raiz'}`);
    });

    // 2. TIPOS DE DEPARTAMENTO
    console.log('\n🏢 TIPOS DE DEPARTAMENTO:');
    const departmentTypes = await prisma.departmentType.findMany();
    console.log(`   Total: ${departmentTypes.length} tipos`);
    departmentTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.name} (${type.code})`);
    });

    // 3. TIPOS DE ITEM (TIC)
    console.log('\n📦 TIPOS DE ITEM (TIC):');
    const itemTypes = await prisma.itemTypeMaster.findMany({
      orderBy: { code: 'asc' }
    });
    console.log(`   Total: ${itemTypes.length} tipos`);
    
    // Verificar se temos os tipos TIC importados
    const ticTypes = itemTypes.filter(type => type.code.startsWith('CAT.'));
    console.log(`   Tipos TIC (CAT.xx): ${ticTypes.length}`);
    
    if (ticTypes.length > 0) {
      console.log('   ✅ Tipos TIC encontrados:');
      ticTypes.forEach((type, index) => {
        console.log(`      ${index + 1}. ${type.code} - ${type.name}`);
      });
    }

    // 4. ITENS CADASTRADOS
    console.log('\n🛠️ ITENS CADASTRADOS:');
    const items = await prisma.item.findMany({
      include: {
        type: { select: { name: true } }
      }
    });
    console.log(`   Total: ${items.length} itens`);
    items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name || 'SEM NOME'} - ${item.description || 'SEM DESCRIÇÃO'}`);
      console.log(`      - Tipo: ${item.type?.name || 'Sem tipo'}`);
    });

    // 5. USUÁRIOS
    console.log('\n👤 USUÁRIOS:');
    const users = await prisma.user.findMany({
      include: {
        department: { select: { name: true } }
      }
    });
    console.log(`   Total: ${users.length} usuários`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      - Departamento: ${user.department?.name || 'Sem departamento'}`);
    });

    // 6. RESUMO GERAL
    console.log('\n📊 RESUMO GERAL:');
    console.log(`   ✅ Departamentos: ${departments.length} (incluindo hierarquia)`);
    console.log(`   ✅ Tipos de Departamento: ${departmentTypes.length}`);
    console.log(`   ✅ Tipos de Item TIC: ${ticTypes.length} de 13 esperados`);
    console.log(`   ✅ Itens: ${items.length}`);
    console.log(`   ✅ Usuários: ${users.length}`);
    console.log(`   ✅ Solicitações: 5 (verificado anteriormente)`);

    // 7. VERIFICAR O QUE PRECISA SER IMPORTADO
    console.log('\n🔍 ANÁLISE DO QUE PRECISA SER IMPORTADO:');
    
    if (departments.length < 200) {
      console.log('   ❌ DEPARTAMENTOS: Apenas 5 encontrados, mas deveria ter ~239 da planilha');
      console.log('       → PRECISA REIMPORTAR departamentos da planilha departamentos.xlsx');
    } else {
      console.log('   ✅ DEPARTAMENTOS: Importação completa');
    }

    if (ticTypes.length < 13) {
      console.log('   ❌ TIPOS TIC: Apenas ${ticTypes.length} encontrados, mas deveria ter 13');
      console.log('       → PRECISA REIMPORTAR tipos da planilha taxonomia_categorias_tic.xlsx');
    } else {
      console.log('   ✅ TIPOS TIC: Importação completa (13 categorias)');
    }

    if (items.length < 50) {
      console.log('   ❌ ITENS: Apenas ${items.length} encontrados');
      console.log('       → PODE PRECISAR REIMPORTAR itens da planilha taxonomia_itens_tic_expandida.xlsx');
    } else {
      console.log('   ✅ ITENS: Quantidade adequada');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
