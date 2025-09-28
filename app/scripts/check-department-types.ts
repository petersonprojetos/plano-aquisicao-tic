
import { config } from 'dotenv';
config();
import { prisma } from '../lib/db';

async function checkDepartmentTypes() {
  try {
    console.log('🔍 Verificando tipos de departamento existentes...');
    
    const departmentTypes = await prisma.departmentType.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📊 Tipos de departamento cadastrados:');
    departmentTypes.forEach(type => {
      console.log(`- ${type.code}: ${type.name} (${type.observations || 'N/A'})`);
    });
    
    console.log('\n🔍 Verificando departamentos existentes...');
    const departmentCount = await prisma.department.count();
    console.log(`Total de departamentos: ${departmentCount}`);
    
    if (departmentCount > 0) {
      const sampleDepartments = await prisma.department.findMany({
        take: 3,
        include: {
          type: true,
          parent: true
        }
      });
      
      console.log('\n📋 Amostra de departamentos:');
      sampleDepartments.forEach(dept => {
        console.log(`- ${dept.code}: ${dept.name} (Tipo: ${dept.type?.name || 'N/A'}, Pai: ${dept.parent?.name || 'N/A'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDepartmentTypes();
