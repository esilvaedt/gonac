// VEMIO Impacta Mock Data
// This is the absolute information origin for all project data

export interface VemioData {
  projectInfo: {
    name: string;
    totalRegisters: number;
    segmentation: {
      percentiles: {
        p25: number;
        p50: number;
        p75: number;
        p90: number;
      };
    };
  };
  segmentacion: {
    entidades: {
      tiendas: Array<{
        id: string;
        nombre: string;
        ubicacion: string;
        segmento: 'hot' | 'balanceada' | 'slow' | 'critica';
        ventasActuales: number;
        ventasObjetivo: number;
        performance: number; // percentage
        diasInventario: number;
        riesgoAgotado: boolean;
        riesgoCaducidad: boolean;
        ventaIncremental: number;
        costoRiesgo: number;
        caracteristicas: {
          patronCompra: string;
          shopper: string;
          geografia: string;
          entorno: string;
        };
      }>;
      skus: Array<{
        id: string;
        nombre: string;
        categoria: string;
        segmento: 'hot' | 'balanceada' | 'slow' | 'critica';
        ventasActuales: number;
        ventasObjetivo: number;
        performance: number;
        inventarioTotal: number;
        vidaAnaquelRestante: number;
        riesgoAgotado: boolean;
        riesgoCaducidad: boolean;
        ventaIncremental: number;
        costoRiesgo: number;
      }>;
      categorias: Array<{
        id: string;
        nombre: string;
        segmento: 'hot' | 'balanceada' | 'slow' | 'critica';
        ventasActuales: number;
        ventasObjetivo: number;
        performance: number;
        skusCount: number;
        ventaIncremental: number;
        costoRiesgo: number;
      }>;
      sabores: Array<{
        id: string;
        nombre: string;
        segmento: 'hot' | 'balanceada' | 'slow' | 'critica';
        ventasActuales: number;
        ventasObjetivo: number;
        performance: number;
        skusCount: number;
        ventaIncremental: number;
        costoRiesgo: number;
      }>;
    };
    insights: {
      hot: {
        ventasIncrementales: number;
        riesgoAgotados: number;
        entidadesCount: number;
      };
      balanceada: {
        entidadesCount: number;
        ventasActuales: number;
      };
      slow: {
        ventasIncrementales: number;
        riesgoCaducidad: number;
        entidadesCount: number;
      };
      critica: {
        ventasIncrementales: number;
        riesgoCaducidad: number;
        entidadesCount: number;
      };
    };
    parametros: {
      diasRiesgoAgotado: number;
      diasReabastecimiento: number;
      fechaLimiteCaducidad: string;
    };
  };
  resumen: {
    ventasTotales: {
      valor: number;
      unidadesVendidas: number;
      crecimientoVsSemanaAnterior: number; // percentage
    };
    sellThrough: {
      porcentaje: number;
      objetivo: number;
      inventarioInicial: number;
    };
    riesgoOportunidades: {
      total: number;
      detectadas: number;
      criticas: number;
    };
    metricas: {
      coberturaNumerica: {
        porcentaje: number;
        objetivo: number;
      };
      coberturaPonderada: {
        porcentaje: number;
        objetivo: number;
      };
      diasInventario: {
        promedio: number;
        objetivo: number;
      };
      tasaQuiebre: {
        porcentaje: number;
        objetivo: number;
      };
      ventaPromedioOutlet: {
        porcentaje: number;
        objetivo: number;
      };
    };
  };
  tiendas: Array<{
    id: string;
    nombre: string;
    ubicacion: string;
    ventasUltimos30Dias: number;
    inventarioActual: number;
    diasInventario: number;
    sellThrough: number;
    riesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  }>;
  tiendasSegmentacion: {
    hot: {
      count: number;
      percentage: number;
      contribution: number;
      metrics: {
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      };
      stores: Array<{
        id: string;
        nombre: string;
        ubicacion: string;
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      }>;
    };
    balanceadas: {
      count: number;
      percentage: number;
      contribution: number;
      metrics: {
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      };
      stores: Array<{
        id: string;
        nombre: string;
        ubicacion: string;
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      }>;
    };
    slow: {
      count: number;
      percentage: number;
      contribution: number;
      metrics: {
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      };
      stores: Array<{
        id: string;
        nombre: string;
        ubicacion: string;
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      }>;
    };
    criticas: {
      count: number;
      percentage: number;
      contribution: number;
      metrics: {
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      };
      stores: Array<{
        id: string;
        nombre: string;
        ubicacion: string;
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      }>;
    };
  };
  skus: Array<{
    id: string;
    nombre: string;
    categoria: string;
    ventasUltimos30Dias: number;
    unidadesVendidas: number;
    inventarioTotal: number;
    vidaAnaquelRestante: number; // días
    rotacion: number;
    performance: number; // percentage vs promedio
    riesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  }>;
  oportunidades: {
    agotado: {
      impacto: number;
      tiendas: number;
      registros: Array<{
        id: string;
        tienda: string;
        sku: string;
        diasInventario: number;
        segmentoTienda: 'hot' | 'balanceada';
        impactoEstimado: number;
        fechaDeteccion: string;
      }>;
    };
    caducidad: {
      impacto: number;
      tiendas: number;
      registros: Array<{
        id: string;
        tienda: string;
        sku: string;
        inventarioRemanente: number;
        fechaCaducidad: string;
        segmentoTienda: 'slow' | 'critica';
        impactoEstimado: number;
        fechaDeteccion: string;
      }>;
    };
    sinVenta: {
      impacto: number;
      tiendas: number;
      registros: Array<{
        id: string;
        tienda: string;
        sku: string;
        diasSinVenta: number;
        ultimaVenta: string;
        impactoEstimado: number;
        fechaDeteccion: string;
      }>;
    };
  };
  acciones: {
    minimizarAgotados: {
      insight: string;
      costoEjecucion: number;
      valorPotencial: {
        pesos: number;
        cantidad: number;
        tiendasImpacto: number;
      };
      detalles: {
        tiendas: Array<{
          id: string;
          nombre: string;
          skus: Array<{
            id: string;
            nombre: string;
            diasAgotado: number;
            inventarioOptimo: number;
            inventarioActual: number;
            pedidoSugerido: number;
          }>;
        }>;
      };
      parametros: {
        diasRiesgo: number;
        nivelOptimo: number;
      };
    };
    exhibicionesAdicionales: {
      insight: string;
      costoEjecucion: number;
      valorPotencial: {
        pesos: number;
        cantidad: number;
        exhibiciones: number;
      };
      detalles: {
        exhibiciones: Array<{
          tienda: string;
          sku: string;
          costoExhibicion: number;
          ventaIncremental: number;
          retorno: number;
        }>;
      };
      parametros: {
        costoPorExhibicion: number;
      };
    };
    promocionesHot: {
      insight: string;
      costoEjecucion: number;
      valorPotencial: {
        pesos: number;
        cantidad: number;
        promociones: number;
      };
      detalles: {
        promociones: Array<{
          tienda: string;
          sku: string;
          descuento: number;
          costoPromocion: number;
          ventaIncremental: number;
          elasticidad: number;
        }>;
      };
      parametros: {
        descuentoPromedio: number;
        factorElasticidad: number;
      };
    };
    promocionesSlow: {
      insight: string;
      costoEjecucion: number;
      valorPotencial: {
        pesos: number;
        cantidad: number;
        inventarioEvacuado: number;
      };
      detalles: {
        promociones: Array<{
          tienda: string;
          sku: string;
          inventarioRiesgo: number;
          descuento: number;
          costoPromocion: number;
          inventarioEvacuado: number;
          porcentajeEvacuado: number;
        }>;
      };
      parametros: {
        descuentoPromedio: number;
        factorElasticidad: number;
      };
    };
    visitaPromotoria: {
      insight: string;
      costoEjecucion: number;
      valorPotencial: {
        pesos: number;
        cantidad: number;
        tiendas: number;
      };
      detalles: {
        visitas: Array<{
          tienda: string;
          ventaPromedio: number;
          potencialCaptura: number;
          costoVisita: number;
          retorno: number;
        }>;
      };
      parametros: {
        costoPorVisita: number;
        ventaPromedioReferencia: number;
      };
    };
  };
}

export const vemioMockData: VemioData = {
  projectInfo: {
    name: "VEMIO Impacta",
    totalRegisters: 1143,
    segmentation: {
      percentiles: {
        p25: 25.5,
        p50: 52.3,
        p75: 78.9,
        p90: 91.2
      }
    }
  },
  segmentacion: {
    entidades: {
      tiendas: [
        {
          id: "SUP001",
          nombre: "Supercito Centro",
          ubicacion: "Centro Histórico",
          segmento: "hot",
          ventasActuales: 15420,
          ventasObjetivo: 12000,
          performance: 128.5,
          diasInventario: 45,
          riesgoAgotado: true,
          riesgoCaducidad: false,
          ventaIncremental: 8500,
          costoRiesgo: 12000,
          caracteristicas: {
            patronCompra: "Alto tráfico, compras frecuentes",
            shopper: "Familias jóvenes, poder adquisitivo medio-alto",
            geografia: "Centro urbano, alta densidad",
            entorno: "Zona comercial, oficinas cercanas"
          }
        },
        {
          id: "SUP002",
          nombre: "Supercito Norte",
          ubicacion: "Zona Norte",
          segmento: "slow",
          ventasActuales: 8930,
          ventasObjetivo: 11500,
          performance: 77.7,
          diasInventario: 78,
          riesgoAgotado: false,
          riesgoCaducidad: true,
          ventaIncremental: 2570,
          costoRiesgo: 18500,
          caracteristicas: {
            patronCompra: "Compras semanales, volumen medio",
            shopper: "Familias establecidas, precio-conscientes",
            geografia: "Zona residencial, acceso vehicular",
            entorno: "Área residencial, competencia cercana"
          }
        },
        {
          id: "SUP003",
          nombre: "Supercito Sur",
          ubicacion: "Zona Sur",
          segmento: "hot",
          ventasActuales: 22150,
          ventasObjetivo: 15000,
          performance: 147.7,
          diasInventario: 28,
          riesgoAgotado: true,
          riesgoCaducidad: false,
          ventaIncremental: 12500,
          costoRiesgo: 15000,
          caracteristicas: {
            patronCompra: "Compras impulsivas, alto ticket",
            shopper: "Jóvenes profesionales, conveniencia",
            geografia: "Zona en crecimiento, nuevos desarrollos",
            entorno: "Centros comerciales, restaurantes"
          }
        },
        {
          id: "SUP004",
          nombre: "Supercito Oriente",
          ubicacion: "Zona Oriente",
          segmento: "critica",
          ventasActuales: 3200,
          ventasObjetivo: 10000,
          performance: 32.0,
          diasInventario: 95,
          riesgoAgotado: false,
          riesgoCaducidad: true,
          ventaIncremental: 6800,
          costoRiesgo: 25000,
          caracteristicas: {
            patronCompra: "Compras esporádicas, bajo volumen",
            shopper: "Población envejecida, ingresos limitados",
            geografia: "Zona periférica, transporte limitado",
            entorno: "Área industrial, poca actividad comercial"
          }
        },
        {
          id: "SUP005",
          nombre: "Supercito Poniente",
          ubicacion: "Zona Poniente",
          segmento: "balanceada",
          ventasActuales: 18750,
          ventasObjetivo: 18000,
          performance: 104.2,
          diasInventario: 35,
          riesgoAgotado: false,
          riesgoCaducidad: false,
          ventaIncremental: 0,
          costoRiesgo: 0,
          caracteristicas: {
            patronCompra: "Compras planificadas, consistentes",
            shopper: "Familias tradicionales, lealtad de marca",
            geografia: "Zona establecida, buena conectividad",
            entorno: "Área mixta residencial-comercial"
          }
        }
      ],
      skus: [
        {
          id: "SKU001",
          nombre: "Producto A Premium",
          categoria: "Premium",
          segmento: "hot",
          ventasActuales: 8500,
          ventasObjetivo: 7000,
          performance: 121.4,
          inventarioTotal: 15000,
          vidaAnaquelRestante: 87,
          riesgoAgotado: true,
          riesgoCaducidad: false,
          ventaIncremental: 3200,
          costoRiesgo: 8500
        },
        {
          id: "SKU002",
          nombre: "Producto B Estándar",
          categoria: "Estándar",
          segmento: "balanceada",
          ventasActuales: 12300,
          ventasObjetivo: 12000,
          performance: 102.5,
          inventarioTotal: 22000,
          vidaAnaquelRestante: 92,
          riesgoAgotado: false,
          riesgoCaducidad: false,
          ventaIncremental: 0,
          costoRiesgo: 0
        },
        {
          id: "SKU003",
          nombre: "Producto C Económico",
          categoria: "Económico",
          segmento: "hot",
          ventasActuales: 18900,
          ventasObjetivo: 14000,
          performance: 135.0,
          inventarioTotal: 28000,
          vidaAnaquelRestante: 89,
          riesgoAgotado: true,
          riesgoCaducidad: false,
          ventaIncremental: 5500,
          costoRiesgo: 12000
        },
        {
          id: "SKU004",
          nombre: "Producto D Premium Plus",
          categoria: "Premium",
          segmento: "critica",
          ventasActuales: 2100,
          ventasObjetivo: 8000,
          performance: 26.3,
          inventarioTotal: 18000,
          vidaAnaquelRestante: 65,
          riesgoAgotado: false,
          riesgoCaducidad: true,
          ventaIncremental: 5900,
          costoRiesgo: 35000
        },
        {
          id: "SKU005",
          nombre: "Producto E Familiar",
          categoria: "Familiar",
          segmento: "slow",
          ventasActuales: 15600,
          ventasObjetivo: 18000,
          performance: 86.7,
          inventarioTotal: 25000,
          vidaAnaquelRestante: 78,
          riesgoAgotado: false,
          riesgoCaducidad: true,
          ventaIncremental: 2400,
          costoRiesgo: 15000
        }
      ],
      categorias: [
        {
          id: "CAT001",
          nombre: "Premium",
          segmento: "slow",
          ventasActuales: 10600,
          ventasObjetivo: 15000,
          performance: 70.7,
          skusCount: 2,
          ventaIncremental: 4400,
          costoRiesgo: 43500
        },
        {
          id: "CAT002",
          nombre: "Estándar",
          segmento: "balanceada",
          ventasActuales: 12300,
          ventasObjetivo: 12000,
          performance: 102.5,
          skusCount: 1,
          ventaIncremental: 0,
          costoRiesgo: 0
        },
        {
          id: "CAT003",
          nombre: "Económico",
          segmento: "hot",
          ventasActuales: 18900,
          ventasObjetivo: 14000,
          performance: 135.0,
          skusCount: 1,
          ventaIncremental: 5500,
          costoRiesgo: 12000
        },
        {
          id: "CAT004",
          nombre: "Familiar",
          segmento: "slow",
          ventasActuales: 15600,
          ventasObjetivo: 18000,
          performance: 86.7,
          skusCount: 1,
          ventaIncremental: 2400,
          costoRiesgo: 15000
        }
      ],
      sabores: [
        {
          id: "SAB001",
          nombre: "Chocolate",
          segmento: "hot",
          ventasActuales: 22500,
          ventasObjetivo: 18000,
          performance: 125.0,
          skusCount: 2,
          ventaIncremental: 6800,
          costoRiesgo: 8500
        },
        {
          id: "SAB002",
          nombre: "Vainilla",
          segmento: "balanceada",
          ventasActuales: 18750,
          ventasObjetivo: 18500,
          performance: 101.4,
          skusCount: 2,
          ventaIncremental: 0,
          costoRiesgo: 0
        },
        {
          id: "SAB003",
          nombre: "Fresa",
          segmento: "slow",
          ventasActuales: 12300,
          ventasObjetivo: 15000,
          performance: 82.0,
          skusCount: 1,
          ventaIncremental: 2700,
          costoRiesgo: 15000
        },
        {
          id: "SAB004",
          nombre: "Cookies & Cream",
          segmento: "critica",
          ventasActuales: 3850,
          ventasObjetivo: 12000,
          performance: 32.1,
          skusCount: 1,
          ventaIncremental: 8150,
          costoRiesgo: 35000
        }
      ]
    },
    insights: {
      hot: {
        ventasIncrementales: 27300,
        riesgoAgotados: 35500,
        entidadesCount: 6
      },
      balanceada: {
        entidadesCount: 3,
        ventasActuales: 49050
      },
      slow: {
        ventasIncrementales: 9500,
        riesgoCaducidad: 48500,
        entidadesCount: 4
      },
      critica: {
        ventasIncrementales: 14950,
        riesgoCaducidad: 60000,
        entidadesCount: 2
      }
    },
    parametros: {
      diasRiesgoAgotado: 10,
      diasReabastecimiento: 15,
      fechaLimiteCaducidad: "2025-02-01"
    }
  },
  resumen: {
    ventasTotales: {
      valor: 120619, // MXN
      unidadesVendidas: 2847,
      crecimientoVsSemanaAnterior: 12.5
    },
    sellThrough: {
      porcentaje: 9.3,
      objetivo: 15.0,
      inventarioInicial: 1300000
    },
    riesgoOportunidades: {
      total: 47,
      detectadas: 23,
      criticas: 8
    },
    metricas: {
      coberturaNumerica: {
        porcentaje: 78.5,
        objetivo: 85.0
      },
      coberturaPonderada: {
        porcentaje: 82.3,
        objetivo: 90.0
      },
      diasInventario: {
        promedio: 56.2,
        objetivo: 45.0
      },
      tasaQuiebre: {
        porcentaje: 12.8,
        objetivo: 8.0
      },
      ventaPromedioOutlet: {
        porcentaje: 94.7,
        objetivo: 100.0
      }
    }
  },
  tiendas: [
    {
      id: "SUP001",
      nombre: "Supercito Centro",
      ubicacion: "Centro Histórico",
      ventasUltimos30Dias: 15420,
      inventarioActual: 89000,
      diasInventario: 45,
      sellThrough: 17.3,
      riesgo: "medio"
    },
    {
      id: "SUP002",
      nombre: "Supercito Norte",
      ubicacion: "Zona Norte",
      ventasUltimos30Dias: 8930,
      inventarioActual: 125000,
      diasInventario: 78,
      sellThrough: 7.1,
      riesgo: "alto"
    },
    {
      id: "SUP003",
      nombre: "Supercito Sur",
      ubicacion: "Zona Sur",
      ventasUltimos30Dias: 22150,
      inventarioActual: 67000,
      diasInventario: 28,
      sellThrough: 33.1,
      riesgo: "bajo"
    },
    {
      id: "SUP004",
      nombre: "Supercito Oriente",
      ubicacion: "Zona Oriente",
      ventasUltimos30Dias: 3200,
      inventarioActual: 98000,
      diasInventario: 95,
      sellThrough: 3.3,
      riesgo: "critico"
    },
    {
      id: "SUP005",
      nombre: "Supercito Poniente",
      ubicacion: "Zona Poniente",
      ventasUltimos30Dias: 18750,
      inventarioActual: 72000,
      diasInventario: 35,
      sellThrough: 26.0,
      riesgo: "bajo"
    }
  ],
  tiendasSegmentacion: {
    hot: {
      count: 38,
      percentage: 29.9,
      contribution: 45.2,
      metrics: {
        ventasValor: 54520,
        ventasUnidades: 1847,
        ventaSemanalTienda: 3580,
        diasInventario: 32
      },
      stores: [
        { id: "SUP001", nombre: "Supercito Centro", ubicacion: "Centro Histórico", ventasValor: 15420, ventasUnidades: 520, ventaSemanalTienda: 3855, diasInventario: 45 },
        { id: "SUP003", nombre: "Supercito Sur", ubicacion: "Zona Sur", ventasValor: 22150, ventasUnidades: 748, ventaSemanalTienda: 5537, diasInventario: 28 },
        { id: "SUP007", nombre: "Supercito Plaza Mayor", ubicacion: "Centro Comercial", ventasValor: 16950, ventasUnidades: 579, ventaSemanalTienda: 4237, diasInventario: 25 }
      ]
    },
    balanceadas: {
      count: 52,
      percentage: 40.9,
      contribution: 38.5,
      metrics: {
        ventasValor: 46440,
        ventasUnidades: 1572,
        ventaSemanalTienda: 2230,
        diasInventario: 48
      },
      stores: [
        { id: "SUP005", nombre: "Supercito Poniente", ubicacion: "Zona Poniente", ventasValor: 18750, ventasUnidades: 634, ventaSemanalTienda: 4687, diasInventario: 35 },
        { id: "SUP008", nombre: "Supercito Jardines", ubicacion: "Zona Residencial", ventasValor: 14320, ventasUnidades: 485, ventaSemanalTienda: 3580, diasInventario: 52 },
        { id: "SUP009", nombre: "Supercito Alameda", ubicacion: "Centro", ventasValor: 13370, ventasUnidades: 453, ventaSemanalTienda: 3342, diasInventario: 55 }
      ]
    },
    slow: {
      count: 28,
      percentage: 22.0,
      contribution: 12.8,
      metrics: {
        ventasValor: 15450,
        ventasUnidades: 523,
        ventaSemanalTienda: 1378,
        diasInventario: 72
      },
      stores: [
        { id: "SUP002", nombre: "Supercito Norte", ubicacion: "Zona Norte", ventasValor: 8930, ventasUnidades: 302, ventaSemanalTienda: 2232, diasInventario: 78 },
        { id: "SUP010", nombre: "Supercito Industrial", ubicacion: "Zona Industrial", ventasValor: 6520, ventasUnidades: 221, ventaSemanalTienda: 1630, diasInventario: 68 }
      ]
    },
    criticas: {
      count: 9,
      percentage: 7.1,
      contribution: 3.5,
      metrics: {
        ventasValor: 4210,
        ventasUnidades: 142,
        ventaSemanalTienda: 1168,
        diasInventario: 89
      },
      stores: [
        { id: "SUP004", nombre: "Supercito Oriente", ubicacion: "Zona Oriente", ventasValor: 3200, ventasUnidades: 108, ventaSemanalTienda: 800, diasInventario: 95 },
        { id: "SUP011", nombre: "Supercito Periferia", ubicacion: "Zona Periférica", ventasValor: 1010, ventasUnidades: 34, ventaSemanalTienda: 252, diasInventario: 102 }
      ]
    }
  },
  skus: [
    {
      id: "SKU001",
      nombre: "Producto A Premium",
      categoria: "Premium",
      ventasUltimos30Dias: 8500,
      unidadesVendidas: 425,
      inventarioTotal: 15000,
      vidaAnaquelRestante: 87,
      rotacion: 2.3,
      performance: 125.5,
      riesgo: "bajo"
    },
    {
      id: "SKU002",
      nombre: "Producto B Estándar",
      categoria: "Estándar",
      ventasUltimos30Dias: 12300,
      unidadesVendidas: 820,
      inventarioTotal: 22000,
      vidaAnaquelRestante: 92,
      rotacion: 1.8,
      performance: 98.2,
      riesgo: "medio"
    },
    {
      id: "SKU003",
      nombre: "Producto C Económico",
      categoria: "Económico",
      ventasUltimos30Dias: 18900,
      unidadesVendidas: 1260,
      inventarioTotal: 28000,
      vidaAnaquelRestante: 89,
      rotacion: 2.7,
      performance: 142.8,
      riesgo: "bajo"
    },
    {
      id: "SKU004",
      nombre: "Producto D Premium Plus",
      categoria: "Premium",
      ventasUltimos30Dias: 2100,
      unidadesVendidas: 84,
      inventarioTotal: 18000,
      vidaAnaquelRestante: 65,
      rotacion: 0.5,
      performance: 35.2,
      riesgo: "critico"
    },
    {
      id: "SKU005",
      nombre: "Producto E Familiar",
      categoria: "Familiar",
      ventasUltimos30Dias: 15600,
      unidadesVendidas: 624,
      inventarioTotal: 25000,
      vidaAnaquelRestante: 78,
      rotacion: 2.1,
      performance: 89.7,
      riesgo: "medio"
    }
  ],
  oportunidades: {
    agotado: {
      impacto: 47500,
      tiendas: 8,
      registros: [
        {
          id: "AGO001",
          tienda: "Supercito Centro",
          sku: "Producto A Premium",
          diasInventario: 8,
          segmentoTienda: "hot",
          impactoEstimado: 8500,
          fechaDeteccion: "2024-11-06"
        },
        {
          id: "AGO002",
          tienda: "Supercito Sur",
          sku: "Producto C Económico",
          diasInventario: 6,
          segmentoTienda: "hot",
          impactoEstimado: 12000,
          fechaDeteccion: "2024-11-06"
        },
        {
          id: "AGO003",
          tienda: "Supercito Poniente",
          sku: "Producto B Estándar",
          diasInventario: 9,
          segmentoTienda: "balanceada",
          impactoEstimado: 7200,
          fechaDeteccion: "2024-11-05"
        },
        {
          id: "AGO004",
          tienda: "Supercito Centro",
          sku: "Producto E Familiar",
          diasInventario: 7,
          segmentoTienda: "hot",
          impactoEstimado: 6800,
          fechaDeteccion: "2024-11-05"
        },
        {
          id: "AGO005",
          tienda: "Supercito Sur",
          sku: "Producto A Premium",
          diasInventario: 5,
          segmentoTienda: "hot",
          impactoEstimado: 9200,
          fechaDeteccion: "2024-11-04"
        },
        {
          id: "AGO006",
          tienda: "Supercito Poniente",
          sku: "Producto C Económico",
          diasInventario: 8,
          segmentoTienda: "balanceada",
          impactoEstimado: 5800,
          fechaDeteccion: "2024-11-04"
        }
      ]
    },
    caducidad: {
      impacto: 78500,
      tiendas: 6,
      registros: [
        {
          id: "CAD001",
          tienda: "Supercito Norte",
          sku: "Producto D Premium Plus",
          inventarioRemanente: 120,
          fechaCaducidad: "2025-02-01",
          segmentoTienda: "slow",
          impactoEstimado: 18000,
          fechaDeteccion: "2024-11-06"
        },
        {
          id: "CAD002",
          tienda: "Supercito Oriente",
          sku: "Producto E Familiar",
          inventarioRemanente: 95,
          fechaCaducidad: "2025-02-01",
          segmentoTienda: "critica",
          impactoEstimado: 15200,
          fechaDeteccion: "2024-11-06"
        },
        {
          id: "CAD003",
          tienda: "Supercito Norte",
          sku: "Producto B Estándar",
          inventarioRemanente: 85,
          fechaCaducidad: "2025-02-01",
          segmentoTienda: "slow",
          impactoEstimado: 12800,
          fechaDeteccion: "2024-11-05"
        },
        {
          id: "CAD004",
          tienda: "Supercito Oriente",
          sku: "Producto D Premium Plus",
          inventarioRemanente: 110,
          fechaCaducidad: "2025-02-01",
          segmentoTienda: "critica",
          impactoEstimado: 22500,
          fechaDeteccion: "2024-11-05"
        },
        {
          id: "CAD005",
          tienda: "Supercito Norte",
          sku: "Producto A Premium",
          inventarioRemanente: 45,
          fechaCaducidad: "2025-02-01",
          segmentoTienda: "slow",
          impactoEstimado: 6800,
          fechaDeteccion: "2024-11-04"
        },
        {
          id: "CAD006",
          tienda: "Supercito Oriente",
          sku: "Producto C Económico",
          inventarioRemanente: 35,
          fechaCaducidad: "2025-02-01",
          segmentoTienda: "critica",
          impactoEstimado: 3200,
          fechaDeteccion: "2024-11-04"
        }
      ]
    },
    sinVenta: {
      impacto: 34200,
      tiendas: 7,
      registros: [
        {
          id: "SV001",
          tienda: "Supercito Oriente",
          sku: "Producto A Premium",
          diasSinVenta: 15,
          ultimaVenta: "2024-10-22",
          impactoEstimado: 8500,
          fechaDeteccion: "2024-11-06"
        },
        {
          id: "SV002",
          tienda: "Supercito Norte",
          sku: "Producto D Premium Plus",
          diasSinVenta: 12,
          ultimaVenta: "2024-10-25",
          impactoEstimado: 6200,
          fechaDeteccion: "2024-11-06"
        },
        {
          id: "SV003",
          tienda: "Supercito Oriente",
          sku: "Producto E Familiar",
          diasSinVenta: 8,
          ultimaVenta: "2024-10-29",
          impactoEstimado: 4800,
          fechaDeteccion: "2024-11-05"
        },
        {
          id: "SV004",
          tienda: "Supercito Norte",
          sku: "Producto C Económico",
          diasSinVenta: 18,
          ultimaVenta: "2024-10-19",
          impactoEstimado: 7500,
          fechaDeteccion: "2024-11-05"
        },
        {
          id: "SV005",
          tienda: "Supercito Oriente",
          sku: "Producto B Estándar",
          diasSinVenta: 6,
          ultimaVenta: "2024-10-31",
          impactoEstimado: 3200,
          fechaDeteccion: "2024-11-04"
        },
        {
          id: "SV006",
          tienda: "Supercito Norte",
          sku: "Producto A Premium",
          diasSinVenta: 10,
          ultimaVenta: "2024-10-27",
          impactoEstimado: 4000,
          fechaDeteccion: "2024-11-04"
        }
      ]
    }
  },
  acciones: {
    minimizarAgotados: {
      insight: "Focalizado en tiendas de alto desempeño para evitar pérdida de ventas",
      costoEjecucion: 0, // No hay costo directo, solo riesgo a mitigar
      valorPotencial: {
        pesos: 47500,
        cantidad: 285,
        tiendasImpacto: 3
      },
      detalles: {
        tiendas: [
          {
            id: "SUP001",
            nombre: "Supercito Centro",
            skus: [
              {
                id: "SKU001",
                nombre: "Producto A Premium",
                diasAgotado: 8,
                inventarioOptimo: 50,
                inventarioActual: 12,
                pedidoSugerido: 38
              },
              {
                id: "SKU003",
                nombre: "Producto C Económico",
                diasAgotado: 9,
                inventarioOptimo: 80,
                inventarioActual: 25,
                pedidoSugerido: 55
              }
            ]
          },
          {
            id: "SUP003",
            nombre: "Supercito Sur",
            skus: [
              {
                id: "SKU001",
                nombre: "Producto A Premium",
                diasAgotado: 7,
                inventarioOptimo: 60,
                inventarioActual: 18,
                pedidoSugerido: 42
              },
              {
                id: "SKU003",
                nombre: "Producto C Económico",
                diasAgotado: 6,
                inventarioOptimo: 100,
                inventarioActual: 35,
                pedidoSugerido: 65
              }
            ]
          }
        ]
      },
      parametros: {
        diasRiesgo: 10,
        nivelOptimo: 30
      }
    },
    exhibicionesAdicionales: {
      insight: "Capturar venta incremental a través de la activación de espacios adicionales en tienda",
      costoEjecucion: 18000,
      valorPotencial: {
        pesos: 85600,
        cantidad: 428,
        exhibiciones: 12
      },
      detalles: {
        exhibiciones: [
          {
            tienda: "Supercito Centro",
            sku: "Producto A Premium",
            costoExhibicion: 1500,
            ventaIncremental: 8500,
            retorno: 5.67
          },
          {
            tienda: "Supercito Sur",
            sku: "Producto C Económico",
            costoExhibicion: 1500,
            ventaIncremental: 12000,
            retorno: 8.0
          },
          {
            tienda: "Supercito Poniente",
            sku: "Producto B Estándar",
            costoExhibicion: 1500,
            ventaIncremental: 7200,
            retorno: 4.8
          }
        ]
      },
      parametros: {
        costoPorExhibicion: 1500
      }
    },
    promocionesHot: {
      insight: "Activar promociones para incrementar el sell through de productos HOT",
      costoEjecucion: 12450,
      valorPotencial: {
        pesos: 68900,
        cantidad: 345,
        promociones: 8
      },
      detalles: {
        promociones: [
          {
            tienda: "Supercito Centro",
            sku: "Producto A Premium",
            descuento: 15,
            costoPromocion: 1875,
            ventaIncremental: 15600,
            elasticidad: 2.1
          },
          {
            tienda: "Supercito Sur",
            sku: "Producto C Económico",
            descuento: 12,
            costoPromocion: 2100,
            ventaIncremental: 18200,
            elasticidad: 1.8
          }
        ]
      },
      parametros: {
        descuentoPromedio: 13.5,
        factorElasticidad: 1.95
      }
    },
    promocionesSlow: {
      insight: "Focalizado en tiendas de bajo desempeño para reducir riesgo de caducidad.",
      costoEjecucion: 15800,
      valorPotencial: {
        pesos: 52300,
        cantidad: 287,
        inventarioEvacuado: 68.5
      },
      detalles: {
        promociones: [
          {
            tienda: "Supercito Norte",
            sku: "Producto D Premium Plus",
            inventarioRiesgo: 120,
            descuento: 25,
            costoPromocion: 4500,
            inventarioEvacuado: 85,
            porcentajeEvacuado: 70.8
          },
          {
            tienda: "Supercito Oriente",
            sku: "Producto E Familiar",
            inventarioRiesgo: 95,
            descuento: 20,
            costoPromocion: 3200,
            inventarioEvacuado: 62,
            porcentajeEvacuado: 65.3
          }
        ]
      },
      parametros: {
        descuentoPromedio: 22.5,
        factorElasticidad: 1.6
      }
    },
    visitaPromotoria: {
      insight: "Activar la venta en tiendas críticas a través de visitas de promotoría",
      costoEjecucion: 8500,
      valorPotencial: {
        pesos: 34200,
        cantidad: 171,
        tiendas: 5
      },
      detalles: {
        visitas: [
          {
            tienda: "Supercito Oriente",
            ventaPromedio: 3200,
            potencialCaptura: 8500,
            costoVisita: 1700,
            retorno: 5.0
          },
          {
            tienda: "Supercito Norte",
            ventaPromedio: 8930,
            potencialCaptura: 12000,
            costoVisita: 1700,
            retorno: 7.06
          }
        ]
      },
      parametros: {
        costoPorVisita: 1700,
        ventaPromedioReferencia: 15000
      }
    }
  }
};