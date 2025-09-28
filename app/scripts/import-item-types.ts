
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function importItemTypes() {
  try {
    console.log('Iniciando importação dos tipos de item...');
    
    // Ler dados do arquivo JSON
    const dataPath = path.join(__dirname, '../../tipos_item_data.json');
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    const tiposItem = JSON.parse(jsonData);
    
    console.log(`Total de tipos de item a importar: ${tiposItem.length}`);
    
    // Não vamos limpar os dados existentes devido às dependências
    console.log('Mantendo tipos de item existentes e adicionando novos...');
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const tipo of tiposItem) {
      try {
        // Tentar criar o tipo de item
        await prisma.itemTypeMaster.create({
          data: {
            code: tipo.codigo,
            name: tipo.nome,
            description: tipo.descricao,
            isActive: true
          }
        });
        
        importedCount++;
        console.log(`✓ Importado: ${tipo.codigo} - ${tipo.nome}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠ Já existe: ${tipo.codigo} - ${tipo.nome}`);
          skippedCount++;
        } else {
          console.error(`✗ Erro ao importar ${tipo.codigo}:`, error.message);
        }
      }
    }
    
    console.log('\n=== RESUMO DA IMPORTAÇÃO ===');
    console.log(`Total processados: ${tiposItem.length}`);
    console.log(`Importados com sucesso: ${importedCount}`);
    console.log(`Ignorados (já existem): ${skippedCount}`);
    
    // Verificar o total atual no banco
    const totalNoBanco = await prisma.itemTypeMaster.count();
    console.log(`Total de tipos de item no banco: ${totalNoBanco}`);
    
    // Mostrar alguns exemplos dos dados inseridos
    console.log('\n=== EXEMPLOS DOS DADOS INSERIDOS ===');
    const exemplos = await prisma.itemTypeMaster.findMany({
      take: 5,
      orderBy: { code: 'asc' }
    });
    
    exemplos.forEach((item, index) => {
      console.log(`${index + 1}. ${item.code} - ${item.name}`);
      console.log(`   Descrição: ${item.description?.substring(0, 100)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erro durante a importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importItemTypes();
