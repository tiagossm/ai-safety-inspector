
// Define global types for Leaflet
declare global {
  interface Window {
    L: any; // Adiciona o tipo L do Leaflet como uma propriedade global do Window
  }
}

// Este tipo é destinado apenas para declarações e não será importado como um módulo
export {};
