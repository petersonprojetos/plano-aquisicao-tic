
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verificando exclusões no banco de dados...');
    
    const total = await prisma.itemExclusion.count();
    console.log(`📊 Total de exclusões: ${total}`);
    
    if (total > 0) {
      const exclusions = await prisma.itemExclusion.findMany({
        take: 5,
        orderBy: { code: 'asc' }
      });
      
      console.log('\n📝 Primeiras 5 exclusões:');
      exclusions.forEach(exclusion => {
        console.log(`- ${exclusion.code}: ${exclusion.name}`);
      });
    }
    
    console.log('\n✅ Verificação concluída');
  } catch (error) {
    console.error('❌ Erro ao verificar exclusões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
