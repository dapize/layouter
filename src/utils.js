/**
 * Utilidades varias
 * @namespace uLayouter
 * @property {Object} processors Lista de procesadores disponibles, junto a su método y regla css
 * @property {Object} flexpv Equivalencias de las propiedades y valores de flexbox.
 * @property {Object} replaceList Lista de caracteres a reemplazar para el nombre de las clases
 */
const uLayouter = {
  /**
   * Obtiene el width y las columnas de los breakpoints.
   * @memberof uLayouter
   * @param {Object} objBps Objeto de los breakPoints
   * @param {String} propName Nombre de la propiedad
   */
  getNums: function (objBps, propName) {
    const sizes = {};
    Object.keys(objBps).forEach(function (bp) {
      sizes[bp] = propName === 'width' && objBps[bp].direct ? 0 : objBps[bp][propName];
    });
    return sizes;
  },

  /**
   * Devuelve un array ordenando los Breakpoints de menor a mayor, dependiendo su width
   * @param {Object} bps Objeto breakpoints definidos en la configuración de la instancia.
   * @returns {Array}
   */
  getBpsOrdered: function (bps) {
    const objBps = this.getNums(bps, 'width');
    const arrBps = Object.keys(bps);
    return arrBps
      .map(function (bp) {
        return objBps[bp];
      })
      .sort(function(a, b) {
        return a - b;
      })
      .map(function (width) {
        return arrBps.filter(function (iBp) {
          return objBps[iBp] === width
        })[0]
      })
  },

  /**
   * Determina si el parametro tiene o no un breakpoint designado
   * @memberof uLayouter
   * @param {String} param Parametro
   * @returns {Boolean}
   */
  haveBreakPoint: function (param) {
    return param.indexOf('@') !== -1;
  },

  /**
   * Sirve para obtener el breakpoint declarado con la propiedad 'direct'.
   * @param {Object} objBps Objecto contenedor con los breakpoints pasados en la configuración.
   */
  getDirectBp: function (objBps) {
    const bpDirect = Object.keys(objBps).filter(function (iBp) {
      return objBps[iBp].direct
    });
    return bpDirect.length ? bpDirect[0] : false;
  },

  /**
   * Prepara el parametro de un método especificado. (EJM: cols, pad, etc)
   * @memberof uLayouter
   * @param {String} param Parametro de configuración sobre el método.
   * @param {Object} objBps Objeto de Breakpoints definidos en la configuración base.
   */
  prepareParam: function (param, objBps) {
    let bp;
    let argParam = param;
    let important = false;
    const haveBp = this.haveBreakPoint(argParam);
    if (haveBp) {
      const bpSplited = argParam.split('@');
      argParam = bpSplited[0];
      bp = bpSplited[1];
    } else {
      const directBp = this.getDirectBp(objBps);
      if (directBp) {
        bp = directBp;
      } else {
        return this.regError("without 'direct' breakpoint", "Don't exists a breakpoint with 'direct' designation.");
      }
    };

    if (param.indexOf('!') !== -1) {
      important = true;
      bp = bp.replace(/!/g, '');
      argParam = argParam.replace(/!/g, '');
    };

    return {
      widthBp: haveBp,
      numbers: argParam,
      breakPoints: bp,
      important: important
    }
  },

  /**
   * Convierte un string a un número
   * @memberof uLayouter
   * @param {String} n El string que se vá a convertir a número
   * @returns {Number}
   */
  stringToNumber: function (n) {
    return typeof n === 'string' ? parseFloat(n) : n;
  },

  /**
   * Calcula el porcentaje de un número
   * @memberof uLayouter
   * @param {Number} n1 Numero de donde se sacará el porcentaje
   * @param {Number} n2 Número de valor máximo
   */
  calPercentage: function (n1, n2) {
    return (n1 * 100) / n2 + '%'
  },

  /**
   * Medidas relativas que sustituirán los pixeles en un valor designado.
   */
  relativeMeasures: ['%', 'rem', 'em', 'ex', 'vw', 'vh'],

  /**
   * Procesa un número, si es porcentual lo calcula, sino lo devuelve tal cual, al igual que cuando se recibe 'auto'.
   * @memberof uLayouter
   * @param {String} n Número a procesar
   * @returns {String}
   */
  processedNumber: function (n) {
    let nProcessed;
    if (n.indexOf('/') !== -1) {
      nProcessed = n.split('/');
      nProcessed = this.calPercentage(this.stringToNumber(nProcessed[0]), this.stringToNumber(nProcessed[1]))
    } else if (n === 'auto') {
      nProcessed = 'auto'
    } else {
      const relativeUnits = this.relativeMeasures.filter(function (unit) {
        return n.indexOf(unit) !== -1
      });
      if (relativeUnits.length) {
        nProcessed = n;
      } else {
        nProcessed = n === '0' ? n : n + 'px';
      }
    };
    return nProcessed;
  },

  /**
   * Registra en consola diferentes tipos de mensaje.
   * @memberof uLayouter
   * @param {Object} obj Contiene tres propiedades: 'type', 'state', 'message' y posiblemente 'data'
   * 
   * @example
   * uLayouter.debug({
   *  type: 'i',
   *  print: true,
   *  message: 'Getting parameters of the Node:',
   *  data: Node
   * });
   */
  debug: function (obj) {
    let printMessage = obj.print || false;
    let cType;
    switch(obj.type || 'l') {
      case 'l':
        cType = 'log';
        break;
      case 'e':
        cType = 'error';
        printMessage = true;
        break;
      case 'w':
        cType = 'warn';
        break;
      case 'i':
        cType = 'info';
        break;
    }
    if (printMessage) {
      let msgObj = Object.create(null);
      msgObj.type = cType;
      if (obj.message) msgObj.message = obj.message;
      if (obj.data) msgObj.data = obj.data;
      console[cType](msgObj);
    } 
  },

  /**
   * Utilidad para retornar errores.
   * @memberof uLayouter
   * @param {String} name Título del Error
   * @param {String} message Descripción del error
   */
  regError: function (name, message) {
    const err = new Error();
    err.name = name;
    err.message = message;
    return this.debug({
      type: 'e',
      message: err
    });
  },

  /**
   * Lista de procesadores disponibles, junto a su método y regla css
   */
  processors: {
    cols: {
      set: 'setCols',
      build: 'buildCols',
      ruleCss: 'width'
    },

    // Paddings
    pad: {
      set: 'setPads',
      build: 'buildPads',
      ruleCss: 'padding'
    },
      padt: {
        set: 'setPadTop',
        build: 'buildPadTop',
        ruleCss: 'padding-top'
      },
      padr: {
        set: 'setPadRight',
        build: 'buildPadRight',
        ruleCss: 'padding-right'
      },
      padb: {
        set: 'setPadBottom',
        build: 'buildPadBottom',
        ruleCss: 'padding-bottom'
      },
      padl: {
        set: 'setPadLeft',
        build: 'buildPadLeft',
        ruleCss: 'padding-left'
      },

    // Margin
    mar: {
      set: 'setMars',
      build: 'buildMars',
      ruleCss: 'margin'
    },
      mart: {
        set: 'setMarTop',
        build: 'buildMarTop',
        ruleCss: 'margin-top'
      },
      marr: {
        set: 'setMarRight',
        build: 'buildMarRight',
        ruleCss: 'margin-right'
      },
      marb: {
        set: 'setMarBottom',
        build: 'buildMarBottom',
        ruleCss: 'margin-bottom'
      },
      marl: {
        set: 'setMarLeft',
        build: 'buildMarLeft',
        ruleCss: 'margin-left'
      },

    // Flex Box
    flex: {
      set: 'setFlex',
      build: 'buildFlex',
      ruleCss: 'display: flex'
    },

    // Max & Min Width & Height
    mxw: {
      set: 'setMaxWidth',
      build: 'buildMaxWidth',
      ruleCss: 'max-width'
    },
    
    mxh: {
      set: 'setMaxHeight',
      build: 'buildMaxHeight',
      ruleCss: 'max-height'
    },

    miw: {
      set: 'setMinWidth',
      build: 'buildMinWidth',
      ruleCss: 'min-width'
    },

    mih: {
      set: 'setMinHeight',
      build: 'buildMinHeight',
      ruleCss: 'min-height'
    },

    // Width & Height
    wdh: {
      set: 'setWidth',
      build: 'buildWidth',
      ruleCss: 'width'
    },

    hgt: {
      set: 'setHeight',
      build: 'buildHeight',
      ruleCss: 'height'
    }
  },

  /**
   * Equivalencias de las propiedades y valores de flexbox
   */
  flexpv: {
    jc: 'justify-content',
    ai: 'align-items',
    ce: 'center',
    fs: 'flex-start',
    fe: 'flex-end',
    sb: 'space-between',
    sa: 'space-around',
    fw: 'flex-wrap',
    nw: 'nowrap',
    w: 'wrap',
    wr: 'wrap-reverse',
    fd: 'flex-direction',
    r: 'row',
    rr: 'row-reverse',
    co: 'column',
    cor: 'column-reverse',
    fg: 'flex-grow',
    fh: 'flex-shrink',
    as: 'align-self',
    or: 'order',
    au: 'auto',
    st: 'stretch',
    bl: 'baseline',
    in: 'initial',
    ih: 'inherit'
  },

  /**
   * Define los atributos de flex que no dependen del mismo.
   */
  flexAttrsSelf: ['fg', 'fh', 'or'],
  
  /**
   * Crea el scope para un BP determinado.
   * @memberof uLayouter
   * @param {Object} config Configuración determinada.
   * @param {String} bp El Break Point, dependiendo de la definición sería: xs, sm, md, lg u otros.
   * @param {String} insertionType Define el tipo de inserción a realizar.
   * @param {HTMLElement} node El nodo base desde donde se insertará el nuevo nodo de estilos (ya sea antes, despues, o como nuevo hermano).
   * @returns {Object}
   */
  createScopeStyles: function (config, bp, insertionType, node) {
    let stylesScope = document.getElementById('layouter-' + bp);
    if (!stylesScope) {
      stylesScope = document.createElement('style');
      stylesScope.appendChild(document.createTextNode('')); // WebKit hack :(
      switch(insertionType) {
        case 'before':
          node.parentNode.insertBefore(stylesScope, node)
          break;
        case 'after':
          const nodeParent = node.parentNode;
          node.nextSibling ? nodeParent.insertBefore(stylesScope, node.nextSibling) : nodeParent.appendChild(stylesScope);
          break;
        case 'append':
          node.appendChild(stylesScope);
          break;
      }
      stylesScope.id = 'layouter-' + bp;
    };
    this.debug({
      type: 'i',
      print: config.debug,
      message: 'Bridge layouter created and inserted in the DOM',
      data: stylesScope
    });
    let bridge;
    if (config.bridge) {
      bridge = {
        method: stylesScope.sheet,
        node: stylesScope
      }
    } else {
      bridge = {
        method: {
          insertRule: function (ruleCss) {
            stylesScope.appendChild(document.createTextNode(ruleCss))
          },
          rules: [],
        },
        node: stylesScope
      }
    }
    return bridge;
  },

  /**
   * Crea los scopes correspondientes para cada breakpoint definido, de forma ordenada, eso es muy importante.
   * @param {Object} config Objeto base de configuración que se pasa en la instancia.
   */
  createScopesStyles: function (config) {
    const arrBps = this.getBpsOrdered(config.breakPoints);
    const scopes = {};
    const _this = this;
    arrBps.forEach(function (bp) {
      scopes[bp] = _this.createScopeStyles(config, bp, 'append', document.body);
    });
    return scopes;
  },

  /**
   * Obtiene el los métodos del nodo 'style' desde un 'className'. 
   * @param {String} className Nombre de la clase CSS
   * @param {Object} instance Instancia de la librería.
   */
  getScopeByclassName: function (className, instance) {
    const bps = instance.breakPoints;
    const nameClass = className.replace(/!/g, '');
    const atIndex = nameClass.indexOf('@');

    // Haven´t a BP designed
    if (atIndex === -1) {
      const directBp = this.getDirectBp(bps);
      return instance.scope[directBp];  
    };

    // Have a BP designed, a normal BP.
    const bp = nameClass.substring(atIndex + 1);
    if (bp.indexOf('-') === -1) return instance.scope[bp]; // A simple BP, not compound (like this: 13/15@sm-md).

    // For the nexts types insertions
    const smallConfig = {
      bridge: instance.bridge,
      debug: instance.debug
    };

    // A BP until. Example 13/15@-md
    if (bp.substring(0, 1) === '-') {
      if (instance.scope.hasOwnProperty(bp)) return instance.scope[bp]; // exists the Scope.
      const bpUntil = bp.substring(1);
      instance.scope[bp] = this.createScopeStyles(smallConfig, bp, 'before', instance.scope[bpUntil].node);
      return instance.scope[bp]; // returning a new scope created
    }

    // A BP from and until (a BP Compount). Example: Example 13/15@sm-md
    if (instance.scope.hasOwnProperty(bp)) return instance.scope[bp]; // exists the Scope.
    
    const fromBp = bp.split('-')[0];
    instance.scope[bp] = this.createScopeStyles(smallConfig, bp, 'after', instance.scope[fromBp].node);
    return instance.scope[bp]; // returning a new scope compounted created
  },

  /**
   * Lista de caracteres a reemplazar para el nombre de las clases
   */
  replaceList: [
    ['\/', ''],
    ['\\', '/'],
    ['/:', ':'],
    ['\\:', ':'],
    ['\\@', '@'],
    ['/@', '@']
  ],

  /**
   * Asignador de nombre de clases a un nodo.
   * @memberof uLayouter
   * @param {Array} classesNames Lista de nombres de las clases
   * @param {Object} Node Nodo a donde agregar las clases
   * @param {Object} instance Instancia iniciada del layouter.
   */
  addClasses: function (classesNames, Node, instance) {
    const _this = this
    classesNames.forEach(function (name) {
      if (Node.classList.contains(name)) {
        _this.debug({
          type: 'w',
          print: instance.debug,
          message: "The class name '" + name + "' already exists in the node and will not be added: ",
          data: Node
        });
      } else {
        Node.classList.add(name);
      }
    });
    this.debug({
      type: 'i',
      print: instance.debug,
      message: 'Adding classes to the Node: ',
      data: {
        classesNames: classesNames,
        node: Node
      }
    });
  },

  /**
   * Limpia los nombres de las clases.
   * @param {Object} obj Contenedor de los nombres de clases y reglas CSS
   * @returns {Object}
   */
  nameCleaner: function (objStyles) {
    const _this = this;
    const obj = {};
    Object.keys(objStyles).forEach(function (name) {
      let newName = name;
      _this.replaceList.forEach(function (reItem) {
        newName = newName.split(reItem[0]).join(reItem[1]);
      });
      obj[newName] = objStyles[name];
    });
    return obj;
  },

  /**
   * Convierte un valor con porcentaje a su equivalente más legible
   * @param {String} percentage Valor en porcentaje a convertir
   */
  percentageConverter: function (percentage) {
    return '0¯' + percentage.replace('%', '');
  },

  /**
   * Crea una lista de estilos CSS apartir de breakpoints y propiedades.
   * @memberof uLayouter
   * @param {String} type Tipo de estilos a dar: 'cols', 'pad', 'mar' o 'flex'
   * @param {Object} bps Objeto de breakpoints registrados
   * @param {Object} instance La instancia creada, el objeto mismo.
   */
  createStyles: function (type, bps, instance) {
    const sizes = instance.sizes;
    const prefix = instance.prefix;
    const prop = this.processors[type].ruleCss;
    const styles = {};
    let rule, bpSplited, bp1, bp2, direct = false, nameClass, propAndVal, shortNameClass, attrsFlexSelfs, nameClassCss;
    const _this = this;
    Object.keys(bps).forEach(function (bp) {
      // preparing the className
      shortNameClass = bps[bp].name;

      // just if have a percentage
      nameClass = shortNameClass;
      if (shortNameClass.indexOf('%') !== -1) nameClass = shortNameClass.replace(shortNameClass, _this.percentageConverter(shortNameClass))
      nameClass = prefix + type + '-' + nameClass.replace(/\//g, '\\/').replace(/:/g, '\\:').replace('@', '\\@').split('.').join('_');

      // Property and value
      if (type === 'flex') {
        propAndVal = bps[bp].value;

        // Searching a flex self inside. ['as' for 'align-self']
        attrsFlexSelfs = ['as'].concat(_this.flexAttrsSelf).filter(function (nameAttrFlex) {
          return shortNameClass.indexOf(nameAttrFlex + ':') !== -1
        });
        if (attrsFlexSelfs.length) {
          // if the items number of flex selft (+1) is diferrent so exists other flex attribute
          if ((attrsFlexSelfs.length + 1) !== shortNameClass.split(':').length) {
            propAndVal += shortNameClass.indexOf('!') !== -1 ? ';display:flex !important;' : ';display:flex;';
          }
        } else {
          propAndVal += shortNameClass.indexOf('!') !== -1 ? ';display:flex !important;' : ';display:flex;';
        }
      } else {
        propAndVal = prop +  ':' + bps[bp].value;
      }

      rule = '@media screen and ';
      if (bp.indexOf('-') === -1) { // no tiene until
        if (sizes[bp]) {
          rule += '(min-width: ' + sizes[bp] + 'px)';
        } else {
          rule = '.' + nameClass.replace(/!/g, '\\!') + '{' + propAndVal + '}';
          direct = true;
        }
      } else { 
        bpSplited = bp.split('-');
        bp1 = bpSplited[0];
        if (bp1) rule += '(min-width: ' + sizes[bp1] + 'px) and ';
        bp2 = bpSplited[1];
        rule += '(max-width: ' + (sizes[bp2] - 1) + 'px)';
      }

      if (!direct) rule += '{.' + nameClass.replace(/!/g, '\\!') + '{' + propAndVal + '}}';
      direct = false;
      styles[nameClass] = rule;
    });
    this.debug({
      type: 'i',
      print: instance.debug,
      message: 'Creating / Created Styles: ',
      data: [bps, styles]
    });
    return styles;
  },

  /**
   * Agrega las reglas CSS para darle estilos a los nodos
   * @memberof uLayouter
   * @param {Object} objStyles Objeto de reglas css junto con su nombre de clase.
   * @param {Object} instance Instancia iniciada del layouter.
   */
  insertRules: function (objStyles, instance) {
    const _this = this;
    Object.keys(objStyles).forEach(function (className) {
      if (!instance.styles.hasOwnProperty(className)) {
        let nodeScope = _this.getScopeByclassName(className, instance);
        if (nodeScope !== undefined) {
          nodeScope.method.insertRule(objStyles[className], (nodeScope.method.rules ? nodeScope.method.rules.length : 0));
          instance.styles[className] = objStyles[className]; // saving in styles vault
        } else {
          _this.regError('Dont exists scope', "Don't exists a scope valid for '" + className + "'");
        }
      }
    });
    this.debug({
      type: 'i',
      print: instance.debug,
      message: 'Inserting Styles: ',
      data: objStyles
    });
  },

  /**
   * Construye el nombre de clase y registra las reglas css.
   * @memberof uLayouter
   * @param {Object} data Lista de data para el procesamiento del CSS
   */
  buildCss: function (data) {
    // creating the styles
    const objStyles = this.createStyles(data.type, data.bps, data.instance);

    // Inserting CSS rules
    if (data.deep) this.insertRules(objStyles, data.instance);

    // name classes cleaner
    return this.nameCleaner(objStyles);
  },

  /**
   * Crea e inserta los estilos calculandolos, y tambien adiciona las clases respectivas al nodo
   * @memberof uLayouter
   * @param {Object} data Lista de data para el procesamiento del CSS
   */
  settingCss: function (data) {
    // Building css stuffs
    const objStyles = this.buildCss(Object.assign({deep: true}, data));
  
    // Adding classes
    this.addClasses(Object.keys(objStyles), data.node, data.instance);
  },

  /**
   * Construye los paddings y margenes.
   * @memberof uLayouter
   * @param {Object} Node Nodo Element HTML
   * @param {String} type Nombre del tipo de atributo a obtener. cols, pad, mar y flex.
   * @param {Object} [parameters] Parametros obtenidos del nodo.
   * @param {Object} instance Instancia actual del Layouter
   */
  buildAttr: function (value, type, instance, insertStyles) {
    if (value === undefined) return this.regError('Parameter Missing', "Don't exists a value determined");
    this.debug({
      type: 'i',
      print: instance.debug,
      message: "Building the 'pads or margs': " + value,
    });
    const _this = this;
    const bpCals = {};
    let paramProcessed, numbersPures, propValue, bps;
    if (!Array.isArray(value)) value = value.split(' ');
    value.forEach(function (param) {
      paramProcessed = _this.prepareParam(param, instance.breakPoints);
      numbersPures = paramProcessed.numbers;
      bps = paramProcessed.breakPoints;
  
      // processing number values
      propValue = numbersPures
        .split('-')
        .map(function (n) {
          return _this.processedNumber(n);
        })
        .join(' ');
      if (paramProcessed.important) propValue += ' !important';
      if (bpCals.hasOwnProperty(bps)) {
        bpCals[bps].value += ';' + propValue
      } else {
        bpCals[bps] = {
          name: param,
          value: propValue
        };
      }
    });

    // Building the classNames and the styles to use.
    return this.buildCss({
      type: type,
      bps: bpCals,
      instance: instance,
      deep: (insertStyles === undefined ? true : insertStyles)
    });
  },
  
  /**
   * Setea los paddings y margenes
   * @memberof uLayouter
   * @param {Object} Node Nodo Element HTML
   * @param {String} type Nombre del tipo de atributo a obtener. cols, pad, mar y flex.
   * @param {Object} [parameters] Parametros obtenidos del nodo.
   * @param {Object} instance Instancia actual del Layouter
   */
  setAttr: function (Node, type, parameters, instance) {
    if (!Node) return this.regError('Non-existent Node', "Don't exists the Node for processing.");
    this.debug({
      type: 'i',
      print: instance.debug,
      message: "Processing the '" + type + "' to the Node:",
      data: Node
    });
    const params = parameters || instance.getParameters(Node);
    if (!params.hasOwnProperty(type)) return this.regError('Parameter Missing', "Don't exists the param '" + type + "' determined");

    // Creating, inserting, and adding classNames of rules in Node.
    const objStyles = this.buildAttr(params[type], type, instance);

    // adding the classes names to the Node
    this.addClasses(Object.keys(objStyles), Node, instance);

    // removing param
    Node.removeAttribute(type);
  }
};

// for test with jest
if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) module.exports = uLayouter;