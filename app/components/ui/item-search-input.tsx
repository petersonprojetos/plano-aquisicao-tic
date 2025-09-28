
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  model?: string;
  categoryId: string;
  typeId: string;
  category: { 
    id: string;
    code: string;
    name: string;
  };
  type: { 
    id: string;
    code: string;
    name: string;
  };
}

interface Exclusion {
  id: string;
  code: string;
  name: string;
  justification: string;
}

interface SearchResult {
  items: Item[];
  exclusions: Exclusion[];
}

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect?: (item: Item) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function ItemSearchInput({ 
  value, 
  onChange, 
  onItemSelect,
  placeholder = "Digite o nome do item...",
  required = false,
  className 
}: ItemSearchInputProps) {
  const [searchResults, setSearchResults] = useState<SearchResult>({ items: [], exclusions: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExclusionAlert, setShowExclusionAlert] = useState(false);
  const [selectedExclusion, setSelectedExclusion] = useState<Exclusion | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para buscar itens
  const searchItems = async (query: string) => {
    if (query.length < 4) {
      setSearchResults({ items: [], exclusions: [] });
      setShowDropdown(false);
      setShowExclusionAlert(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data: SearchResult = await response.json();
        setSearchResults(data);
        setShowDropdown(data.items.length > 0);
        
        // Verifica se há itens excluídos correspondentes
        if (data.exclusions.length > 0) {
          setSelectedExclusion(data.exclusions[0]);
          setShowExclusionAlert(true);
        } else {
          setShowExclusionAlert(false);
          setSelectedExclusion(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && inputFocused) {
        searchItems(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, inputFocused]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Esconder alerta se o usuário está modificando o texto
    if (newValue !== value) {
      setShowExclusionAlert(false);
    }
  };

  const handleItemSelect = (item: Item) => {
    setShowDropdown(false);
    setShowExclusionAlert(false);
    setInputFocused(false);
    
    // Chama o callback se fornecido, para permitir ao componente pai atualizar outros campos
    if (onItemSelect) {
      onItemSelect(item);
    }
    
    // Foca no input após um pequeno delay para garantir que tudo foi processado
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    if (value.length >= 4 && searchResults.items.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Usamos um pequeno delay para permitir que o clique em um item do dropdown seja processado
    // antes de fechar o dropdown. O onMouseDown no item do dropdown previne o blur.
    setTimeout(() => {
      if (inputFocused) setInputFocused(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className={cn("pr-10", className)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && searchResults.items.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {searchResults.items.map((item) => (
            <div
              key={item.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault(); // Previne que o input perca o foco (blur)
                handleItemSelect(item);
              }}
            >
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-500">
                {item.code} • {item.category.name} • {item.type.name}
                {item.model && ` • ${item.model}`}
              </div>
              {item.description && (
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alerta de item excluído */}
      {showExclusionAlert && selectedExclusion && (
        <Alert className="mt-2 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> O item "{selectedExclusion.name}" não consta no rol de bens e serviços de TIC.
            <div className="text-xs mt-1 text-orange-700">
              <strong>Justificativa:</strong> {selectedExclusion.justification}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Dica de uso */}
      {value.length > 0 && value.length < 4 && inputFocused && (
        <div className="text-xs text-gray-500 mt-1">
          Digite pelo menos 4 caracteres para buscar itens...
        </div>
      )}
    </div>
  );
}
