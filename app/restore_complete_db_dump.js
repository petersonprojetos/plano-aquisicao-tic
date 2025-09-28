
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restoreCompleteDump(dumpFilePath) {
  try {
    console.log('🔄 Iniciando restauração completa do banco de dados...');
    console.log(`📁 Arquivo de dump: ${dumpFilePath}`);
    
    // Ler o arquivo de dump
    const dumpContent = fs.readFileSync(dumpFilePath, 'utf-8');
    const dump = JSON.parse(dumpContent);
    
    console.log(`📅 Dump criado em: ${dump.timestamp}`);
    console.log(`📊 Restaurando ${Object.keys(dump.data).length} tabelas...`);
    
    // Ordem específica para evitar conflitos de FK
    const tableOrder = [
      'departmentType',
      'department',
      'user',
      'contractType',
      'acquisitionTypeMaster',
      'itemCategoryMaster',
      'itemTypeMaster', 
      'item',
      'itemExclusion',
      'request',
      'requestItem',
      'requestHistory',
      'notification',
      'annualPlan',
      'systemParameters',
      'account',
      'session',
      'verificationToken'
    ];

    let totalRestored = 0;

    for (const tableName of tableOrder) {
      const tableData = dump.data[tableName];
      if (!tableData || tableData.length === 0) {
        console.log(`⏩ ${tableName}: Nenhum dado para restaurar`);
        continue;
      }

      try {
        console.log(`📊 Restaurando ${tableName}: ${tableData.length} registros...`);
        
        // Usar upsert para evitar conflitos de duplicação
        for (const record of tableData) {
          try {
            switch(tableName) {
              case 'departmentType':
                await prisma.departmentType.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'department':
                await prisma.department.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'user':
                await prisma.user.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'contractType':
                await prisma.contractType.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'acquisitionTypeMaster':
                await prisma.acquisitionTypeMaster.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'itemCategoryMaster':
                await prisma.itemCategoryMaster.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'itemTypeMaster':
                await prisma.itemTypeMaster.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'item':
                await prisma.item.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'itemExclusion':
                await prisma.itemExclusion.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'request':
                await prisma.request.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'requestItem':
                await prisma.requestItem.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'requestHistory':
                await prisma.requestHistory.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'notification':
                await prisma.notification.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'annualPlan':
                await prisma.annualPlan.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'systemParameters':
                await prisma.systemParameters.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'account':
                await prisma.account.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'session':
                await prisma.session.upsert({
                  where: { id: record.id },
                  update: record,
                  create: record
                });
                break;
                
              case 'verificationToken':
                await prisma.verificationToken.upsert({
                  where: { 
                    identifier_token: {
                      identifier: record.identifier,
                      token: record.token
                    }
                  },
                  update: record,
                  create: record
                });
                break;
            }
          } catch (recordError) {
            console.warn(`⚠️  Erro ao restaurar registro em ${tableName}:`, recordError.message);
          }
        }
        
        console.log(`✅ ${tableName}: ${tableData.length} registros restaurados`);
        totalRestored += tableData.length;
        
      } catch (tableError) {
        console.error(`❌ Erro ao restaurar tabela ${tableName}:`, tableError.message);
      }
    }
    
    console.log('\n🎉 Restauração completa finalizada!');
    console.log(`📊 Total de registros restaurados: ${totalRestored}`);
    console.log('\n📈 Resumo da restauração:');
    
    // Verificar dados restaurados
    for (const tableName of tableOrder) {
      const tableData = dump.data[tableName];
      if (tableData && tableData.length > 0) {
        console.log(`- ${tableName}: ${tableData.length} registros`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante a restauração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar se o arquivo foi fornecido como argumento
const dumpFile = process.argv[2];
if (!dumpFile) {
  console.error('❌ Por favor, forneça o caminho para o arquivo de dump');
  console.log('💡 Uso: node restore_complete_db_dump.js caminho/para/dump.json');
  process.exit(1);
}

// Verificar se o arquivo existe
if (!fs.existsSync(dumpFile)) {
  console.error(`❌ Arquivo não encontrado: ${dumpFile}`);
  process.exit(1);
}

// Executar a restauração
restoreCompleteDump(dumpFile)
  .then(() => {
    console.log('\n✨ Restauração concluída with sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na restauração:', error);
    process.exit(1);
  });
