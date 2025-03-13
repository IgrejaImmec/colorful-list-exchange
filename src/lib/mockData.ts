
import { ListItem } from "@/context/ListContext";
import { ExtendedListStyle } from "@/lib/api";
import { ListSummary } from "@/context/ListsContext";

// Mock user data
export const mockUsers = [
  {
    id: "user-001",
    name: "João Silva",
    email: "joao.silva@example.com",
    lists: ["list-001", "list-002"]
  },
  {
    id: "user-002",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    lists: ["list-003"]
  },
  {
    id: "user-003",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    lists: ["list-004", "list-005"]
  }
];

// Mock list items for different list types
export const mockWeddingItems: ListItem[] = [
  {
    id: "item-001",
    name: "Jogo de Panelas Tramontina",
    description: "Conjunto de panelas antiaderentes, 5 peças",
    claimed: false
  },
  {
    id: "item-002",
    name: "Liquidificador Philips Walita",
    description: "Liquidificador 3 velocidades, 800W, cor preta",
    claimed: true,
    claimedBy: { name: "Tiago Mendes", phone: "(11) 98765-4321" }
  },
  {
    id: "item-003",
    name: "Jogo de Lençóis King Size",
    description: "Lençol 100% algodão egípcio, 300 fios",
    claimed: false
  },
  {
    id: "item-004",
    name: "Smart TV Samsung 55\"",
    description: "TV LED 4K, com Wi-Fi e Netflix",
    claimed: false
  },
  {
    id: "item-005",
    name: "Kit Banheiro",
    description: "Conjunto com porta escova, saboneteira e porta toalhas",
    claimed: true,
    claimedBy: { name: "Luiza Costa", phone: "(11) 91234-5678" }
  }
];

export const mockBabyShowerItems: ListItem[] = [
  {
    id: "item-101",
    name: "Carrinho de Bebê",
    description: "Modelo conversível, com rodas reforçadas",
    claimed: false
  },
  {
    id: "item-102",
    name: "Berço",
    description: "Berço 3 em 1, convertível em mini-cama",
    claimed: true,
    claimedBy: { name: "Ana Ferreira", phone: "(21) 98888-7777" }
  },
  {
    id: "item-103",
    name: "Kit com 6 Mamadeiras",
    description: "Mamadeiras anticólica, em diversos tamanhos",
    claimed: false
  },
  {
    id: "item-104",
    name: "Trocador",
    description: "Trocador portátil com bolsos para fraldas",
    claimed: false
  },
  {
    id: "item-105",
    name: "Monitor de Bebê",
    description: "Monitor com câmera e visão noturna",
    claimed: true,
    claimedBy: { name: "Roberto Almeida", phone: "(21) 97777-6666" }
  }
];

export const mockBirthdayItems: ListItem[] = [
  {
    id: "item-201",
    name: "PlayStation 5",
    description: "Console com controle sem fio",
    claimed: false
  },
  {
    id: "item-202",
    name: "Headphone Bluetooth",
    description: "Fone com cancelamento de ruído",
    claimed: true,
    claimedBy: { name: "Carlos Eduardo", phone: "(31) 95555-4444" }
  },
  {
    id: "item-203",
    name: "Kit Camisetas",
    description: "Conjunto com 3 camisetas de banda",
    claimed: false
  },
  {
    id: "item-204",
    name: "Perfume Importado",
    description: "Fragrância masculina, 100ml",
    claimed: false
  },
  {
    id: "item-205",
    name: "Relógio Smartwatch",
    description: "Com GPS e monitor cardíaco",
    claimed: true,
    claimedBy: { name: "Juliana Ribeiro", phone: "(31) 94444-3333" }
  }
];

// Mock list styles
export const mockListStyles: Record<string, ExtendedListStyle> = {
  wedding: {
    backgroundColor: "#f8f5ff",
    accentColor: "#a055ff",
    fontFamily: "'Playfair Display', serif",
    borderRadius: "rounded-lg",
    itemSpacing: "6",
    backgroundImage: "",
    backgroundPattern: "pattern-hearts",
    titleColor: "#6d28d9",
    textColor: "#4b5563"
  },
  babyShower: {
    backgroundColor: "#f0f9ff",
    accentColor: "#3b82f6",
    fontFamily: "'Quicksand', sans-serif",
    borderRadius: "rounded-full",
    itemSpacing: "5",
    backgroundImage: "",
    backgroundPattern: "pattern-dots",
    titleColor: "#1e40af",
    textColor: "#4b5563"
  },
  birthday: {
    backgroundColor: "#fff7ed",
    accentColor: "#f59e0b",
    fontFamily: "'Poppins', sans-serif",
    borderRadius: "rounded-2xl",
    itemSpacing: "4",
    backgroundImage: "",
    backgroundPattern: "pattern-confetti",
    titleColor: "#b45309",
    textColor: "#4b5563"
  },
  graduation: {
    backgroundColor: "#f0fdf4",
    accentColor: "#10b981",
    fontFamily: "'Montserrat', sans-serif",
    borderRadius: "rounded-md",
    itemSpacing: "4",
    backgroundImage: "",
    backgroundPattern: "pattern-books",
    titleColor: "#065f46",
    textColor: "#4b5563"
  }
};

// Mock complete lists
export const mockLists: Record<string, {
  items: ListItem[],
  settings: {
    title: string,
    description: string,
    image: string,
    style: ExtendedListStyle
  }
}> = {
  "list-001": {
    items: mockWeddingItems,
    settings: {
      title: "Lista de Casamento João e Ana",
      description: "Celebrando nosso amor! Agradecemos seu carinho e presença em nosso grande dia.",
      image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop",
      style: mockListStyles.wedding
    }
  },
  "list-002": {
    items: mockBirthdayItems,
    settings: {
      title: "Aniversário de 30 Anos do João",
      description: "Venha celebrar mais um ano de vida! Sua presença já é um grande presente.",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop",
      style: mockListStyles.birthday
    }
  },
  "list-003": {
    items: mockBabyShowerItems,
    settings: {
      title: "Chá de Bebê da Maria",
      description: "Nosso príncipe está chegando! Venha celebrar este momento especial conosco.",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1770&auto=format&fit=crop",
      style: mockListStyles.babyShower
    }
  },
  "list-004": {
    items: [...mockWeddingItems.slice(0, 3), ...mockBirthdayItems.slice(1, 3)],
    settings: {
      title: "Formatura Pedro - Engenharia",
      description: "Depois de anos de dedicação, estou finalmente me formando! Celebre comigo esta conquista.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1770&auto=format&fit=crop",
      style: mockListStyles.graduation
    }
  },
  "list-005": {
    items: mockBirthdayItems.slice(0, 3),
    settings: {
      title: "Aniversário de 5 anos - Sofia",
      description: "Venha celebrar o aniversário da nossa princesa Sofia com muita diversão e alegria!",
      image: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=2070&auto=format&fit=crop",
      style: mockListStyles.birthday
    }
  }
};

// List summaries for dashboard
export const mockListSummaries: Record<string, ListSummary[]> = {
  "user-001": [
    {
      id: "list-001",
      title: "Lista de Casamento João e Ana",
      description: "Celebrando nosso amor! Agradecemos seu carinho e presença em nosso grande dia.",
      itemCount: mockWeddingItems.length,
      claimedCount: mockWeddingItems.filter(item => item.claimed).length,
      createdAt: new Date(2023, 5, 15),
      image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop"
    },
    {
      id: "list-002",
      title: "Aniversário de 30 Anos do João",
      description: "Venha celebrar mais um ano de vida! Sua presença já é um grande presente.",
      itemCount: mockBirthdayItems.length,
      claimedCount: mockBirthdayItems.filter(item => item.claimed).length,
      createdAt: new Date(2023, 8, 10),
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop"
    }
  ],
  "user-002": [
    {
      id: "list-003",
      title: "Chá de Bebê da Maria",
      description: "Nosso príncipe está chegando! Venha celebrar este momento especial conosco.",
      itemCount: mockBabyShowerItems.length,
      claimedCount: mockBabyShowerItems.filter(item => item.claimed).length,
      createdAt: new Date(2023, 7, 22),
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1770&auto=format&fit=crop"
    }
  ],
  "user-003": [
    {
      id: "list-004",
      title: "Formatura Pedro - Engenharia",
      description: "Depois de anos de dedicação, estou finalmente me formando! Celebre comigo esta conquista.",
      itemCount: 6,
      claimedCount: 2,
      createdAt: new Date(2023, 10, 5),
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1770&auto=format&fit=crop"
    },
    {
      id: "list-005",
      title: "Aniversário de 5 anos - Sofia",
      description: "Venha celebrar o aniversário da nossa princesa Sofia com muita diversão e alegria!",
      itemCount: 3,
      claimedCount: 0,
      createdAt: new Date(2023, 11, 20),
      image: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=2070&auto=format&fit=crop"
    }
  ]
};

// Template lists for new users to choose from
export const mockTemplates = [
  {
    id: "template-wedding",
    title: "Lista de Casamento",
    description: "Template para casamentos com itens comuns para recém-casados.",
    image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop",
    items: mockWeddingItems,
    style: mockListStyles.wedding
  },
  {
    id: "template-babyshower",
    title: "Chá de Bebê",
    description: "Template para chá de bebê com itens essenciais para o recém-nascido.",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1770&auto=format&fit=crop",
    items: mockBabyShowerItems,
    style: mockListStyles.babyShower
  },
  {
    id: "template-birthday",
    title: "Aniversário",
    description: "Template para festas de aniversário com sugestões de presentes variados.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070&auto=format&fit=crop",
    items: mockBirthdayItems,
    style: mockListStyles.birthday
  }
];
