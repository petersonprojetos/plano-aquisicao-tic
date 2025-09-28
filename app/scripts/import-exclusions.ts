
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExclusionData {
  code: string;
  name: string;
  justification: string;
}

async function importExclusions() {
  try {
    console.log('🚀 Iniciando importação de exclusões...');

    // Ler arquivo JSON
    const jsonPath = path.resolve(__dirname, '../../exclusions_data.json');
    const exclusionsData: ExclusionData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`📄 Encontradas ${exclusionsData.length} exclusões no arquivo JSON`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Processar cada exclusão
    for (const exclusionData of exclusionsData) {
      try {
        // Verificar se a exclusão já existe
        const existingExclusion = await prisma.itemExclusion.findUnique({
          where: { code: exclusionData.code }
        });

        if (existingExclusion) {
          console.log(`⚠️  Exclusão ${exclusionData.code} já existe - pulando`);
          skipped++;
          continue;
        }

        // Criar a exclusão
        const exclusion = await prisma.itemExclusion.create({
          data: {
            code: exclusionData.code,
            name: exclusionData.name,
            justification: exclusionData.justification,
          }
        });

        console.log(`✅ Exclusão importada: ${exclusion.code} - ${exclusion.name}`);
        imported++;

      } catch (error) {
        console.error(`❌ Erro ao importar exclusão ${exclusionData.code}:`, error);
        errors++;
      }
    }

    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`✅ Exclusões importadas: ${imported}`);
    console.log(`⚠️  Exclusões puladas (já existem): ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📄 Total processado: ${exclusionsData.length}`);

  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar importação
importExclusions();
