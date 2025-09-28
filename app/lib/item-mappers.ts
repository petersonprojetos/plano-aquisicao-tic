

// Função para mapear categoria da base para enum do Prisma
export function mapCategoryNameToPrismaEnum(categoryName: string): string {
  const lowerCategoryName = categoryName.toLowerCase();
  
  // Mapeamento para os enums do Prisma: PRODUCT ou SERVICE
  if (lowerCategoryName.includes('desenvolvimento') || 
      lowerCategoryName.includes('sustentação') || 
      lowerCategoryName.includes('hospedagem') ||
      lowerCategoryName.includes('suporte') ||
      lowerCategoryName.includes('atendimento') ||
      lowerCategoryName.includes('infraestrutura') ||
      lowerCategoryName.includes('serviço') ||
      lowerCategoryName.includes('service') ||
      lowerCategoryName.includes('dvss') ||
      lowerCategoryName.includes('hspd') ||
      lowerCategoryName.includes('suat') ||
      lowerCategoryName.includes('inft')) {
    return 'SERVICE';
  }
  
  // Produtos (MATERIAIS E EQUIPAMENTOS DE TIC)
  if (lowerCategoryName.includes('materiais') ||
      lowerCategoryName.includes('equipamentos') ||
      lowerCategoryName.includes('meqt') ||
      lowerCategoryName.includes('product') ||
      lowerCategoryName.includes('produto')) {
    return 'PRODUCT';
  }
  
  return 'PRODUCT'; // Default para produto
}

// Função para mapear tipo da base para enum do Prisma  
export function mapTypeNameToPrismaEnum(typeName: string): string {
  const lowerTypeName = typeName.toLowerCase();
  
  // Mapeamento para os enums do Prisma
  if (lowerTypeName.includes('computador') || lowerTypeName.includes('estações')) {
    return 'COMPUTER';
  } else if (lowerTypeName.includes('notebook') || lowerTypeName.includes('portátil')) {
    return 'NOTEBOOK';
  } else if (lowerTypeName.includes('impressora') || lowerTypeName.includes('printer')) {
    return 'PRINTER';
  } else if (lowerTypeName.includes('monitor') || lowerTypeName.includes('display')) {
    return 'MONITOR';
  } else if (lowerTypeName.includes('ups') || lowerTypeName.includes('nobreak')) {
    return 'UPS';
  } else if (lowerTypeName.includes('rede') || lowerTypeName.includes('network') ||
             lowerTypeName.includes('instalação')) {
    return 'NETWORK_INSTALLATION';
  } else if (lowerTypeName.includes('software') || lowerTypeName.includes('sistema') ||
             lowerTypeName.includes('aplicativo') || lowerTypeName.includes('licença')) {
    return 'SOFTWARE';
  } else if (lowerTypeName.includes('manutenção') || lowerTypeName.includes('maintenance') ||
             lowerTypeName.includes('serviço') || lowerTypeName.includes('sustentação')) {
    return 'MAINTENANCE';
  } else if (lowerTypeName.includes('periférico') || lowerTypeName.includes('peripheral') ||
             lowerTypeName.includes('mouse') || lowerTypeName.includes('teclado') ||
             lowerTypeName.includes('webcam')) {
    return 'PERIPHERALS';
  }
  
  return 'OTHER'; // Default para outros
}

// Função para determinar o tipo de aquisição baseado na categoria
export function mapCategoryToAcquisitionType(categoryName: string): string {
  const lowerCategoryName = categoryName.toLowerCase();
  
  if (lowerCategoryName.includes('serviço') || lowerCategoryName.includes('service') ||
      lowerCategoryName.includes('desenvolvimento') || lowerCategoryName.includes('sustentação') ||
      lowerCategoryName.includes('hospedagem') || lowerCategoryName.includes('suporte') ||
      lowerCategoryName.includes('infraestrutura')) {
    return 'RENTAL'; // Serviços geralmente são aluguel/locação
  }
  return 'PURCHASE'; // Produtos geralmente são compra
}

// Função para mapear nome da categoria para valor do formulário (mantida para compatibilidade)
export function mapCategoryNameToFormValue(categoryName: string): string {
  return mapCategoryNameToPrismaEnum(categoryName);
}

// Função para mapear nome do tipo para valor do formulário (mantida para compatibilidade)  
export function mapTypeNameToFormValue(typeName: string): string {
  return mapTypeNameToPrismaEnum(typeName);
}

