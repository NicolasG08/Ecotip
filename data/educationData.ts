import { Gradients, Palette } from '@/constants/theme';

export type Lesson = {
    id: string;
    title: string;
    duration: string;
    icon: string;
    content: string;
};

export type Course = {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
    duration: string;
    level: string;
    gradient: readonly string[];
    icon: string;
    xp: number;
    category: string;
};

export const COURSES_DATA: Course[] = [
    {
        id: '1',
        title: 'Introducción al Reciclaje',
        description: 'Aprende los fundamentos del reciclaje y por qué es vital para el planeta',
        duration: '45 min',
        level: 'Principiante',
        gradient: Gradients.primary,
        icon: 'leaf',
        xp: 100,
        category: 'basics',
        lessons: [
            {
                id: '1-1', title: '¿Qué es el reciclaje?', duration: '5 min', icon: 'help-circle',
                content: 'El reciclaje es el proceso de convertir residuos en nuevos materiales y objetos reutilizables. Es una alternativa al desecho convencional que puede ahorrar materiales y reducir emisiones de gases de efecto invernadero.\n\nCada año se generan más de 2,000 millones de toneladas de residuos sólidos en el mundo. De estos, solo el 16% se recicla. El resto termina en vertederos, incineradoras o contaminando ecosistemas.\n\n📌 Dato clave: Reciclar una tonelada de papel salva 17 árboles adultos.',
            },
            {
                id: '1-2', title: 'Historia del reciclaje', duration: '6 min', icon: 'time',
                content: 'El reciclaje no es un concepto moderno. Ya en la antigua Roma se fundían monedas y estatuas de bronce para reutilizar el metal. Durante la Segunda Guerra Mundial, países enteros reciclaban metales, caucho y tela para apoyar el esfuerzo bélico.\n\nEl símbolo universal de reciclaje ♻️ fue diseñado en 1970 por Gary Anderson, un estudiante de arquitectura de 23 años, como parte de un concurso para el primer Día de la Tierra.\n\nDesde entonces, las tasas de reciclaje han mejorado enormemente gracias a políticas públicas, educación ambiental, y la creciente conciencia ciudadana.',
            },
            {
                id: '1-3', title: 'Impacto ambiental', duration: '6 min', icon: 'earth',
                content: 'El reciclaje tiene un impacto directo y medible en el medio ambiente:\n\n🌡️ Reducción de CO₂: Reciclar aluminio ahorra hasta un 95% de la energía necesaria para producirlo desde cero.\n\n💧 Ahorro de agua: Fabricar papel reciclado usa un 60% menos de agua que papel virgen.\n\n🌳 Conservación de bosques: Cada tonelada de cartón reciclado evita la tala de 12 a 17 árboles.\n\n🐠 Protección marina: El 80% de la contaminación oceánica proviene de fuentes terrestres. Reciclar plástico correctamente evita que llegue al mar.',
            },
            {
                id: '1-4', title: 'Los 3 principios: Reducir, Reutilizar, Reciclar', duration: '5 min', icon: 'refresh-circle',
                content: 'La regla de las 3R es la base de la gestión sostenible de residuos:\n\n1️⃣ REDUCIR: Es lo más importante. Compra solo lo necesario, evita productos con exceso de empaque, elige productos duraderos.\n\n2️⃣ REUTILIZAR: Antes de tirar, piensa si el objeto puede tener otro uso. Un frasco de vidrio puede convertirse en un florero o contenedor.\n\n3️⃣ RECICLAR: Cuando ya no puedes reducir ni reutilizar, separa correctamente los materiales para que puedan ser transformados en nuevos productos.\n\n💡 Tip: La prioridad es siempre en ese orden. Reciclar es la última opción, no la primera.',
            },
            {
                id: '1-5', title: 'Mitos y verdades del reciclaje', duration: '6 min', icon: 'chatbubble-ellipses',
                content: '❌ MITO: "No vale la pena reciclar porque todo va al mismo vertedero."\n✅ VERDAD: En la mayoría de ciudades con sistemas de reciclaje, los materiales sí se procesan por separado.\n\n❌ MITO: "El plástico se puede reciclar infinitamente."\n✅ VERDAD: El plástico pierde calidad en cada ciclo. Solo el vidrio y el aluminio se reciclan indefinidamente sin perder propiedades.\n\n❌ MITO: "Los productos biodegradables no necesitan reciclarse."\n✅ VERDAD: Los materiales biodegradables necesitan condiciones específicas para descomponerse. En un vertedero estándar, incluso un plátano tarda años.',
            },
            {
                id: '1-6', title: 'Tipos de materiales reciclables', duration: '5 min', icon: 'cube',
                content: 'Los principales materiales que puedes reciclar son:\n\n📄 PAPEL Y CARTÓN: Periódicos, revistas, cajas, cartón corrugado. No recicles papel sucio con comida.\n\n🥫 METALES: Latas de aluminio, latas de conserva, papel aluminio limpio.\n\n🍶 VIDRIO: Botellas, frascos. No confundir con cristal (vasos, espejos) que NO son reciclables.\n\n♻️ PLÁSTICOS: Revisa el número dentro del triángulo. Los tipos 1 (PET) y 2 (HDPE) son los más reciclados.\n\n🔋 ESPECIALES: Pilas, electrónicos y aceite de cocina requieren puntos de recolección específicos.',
            },
            {
                id: '1-7', title: 'Tu primera acción verde', duration: '5 min', icon: 'rocket',
                content: '¡Es hora de actuar! Aquí tienes tu primer ejercicio práctico:\n\n🏠 PASO 1: Busca dos contenedores en tu casa (pueden ser cajas o bolsas).\n\n🏷️ PASO 2: Etiquétalos como "Reciclable" y "No reciclable".\n\n🗑️ PASO 3: Durante una semana, separa conscientemente tu basura.\n\n📊 PASO 4: Al final de la semana, observa cuánto de lo que tiras es realmente reciclable.\n\nLa mayoría de las personas descubren que entre el 30% y el 50% de su basura puede reciclarse. ¡Imagina el impacto si todos lo hiciéramos!',
            },
            {
                id: '1-8', title: 'Resumen y próximos pasos', duration: '4 min', icon: 'flag',
                content: '🎉 ¡Felicidades! Has completado el curso de Introducción al Reciclaje.\n\nLo que has aprendido:\n• Qué es el reciclaje y su historia\n• El impacto ambiental real de reciclar\n• La regla de las 3R\n• Mitos vs. verdades\n• Tipos de materiales reciclables\n• Tu primera acción concreta\n\n🌟 Próximo curso recomendado: "Clasificación de Residuos" donde aprenderás a identificar exactamente qué va en cada contenedor.\n\n💚 Recuerda: cada pequeño gesto cuenta. No necesitas ser perfecto, solo consciente.',
            },
        ],
    },
    {
        id: '2',
        title: 'Clasificación de Residuos',
        description: 'Domina el arte de separar correctamente cada tipo de residuo',
        duration: '1h 20min',
        level: 'Intermedio',
        gradient: Gradients.ocean,
        icon: 'layers',
        xp: 150,
        category: 'basics',
        lessons: [
            {
                id: '2-1', title: 'Los contenedores por color', duration: '6 min', icon: 'color-palette',
                content: 'Cada color de contenedor tiene un propósito específico:\n\n🟡 AMARILLO — Envases: Plásticos, latas, briks (tetrapak). Todo lo que sea un envase y no sea papel ni vidrio.\n\n🔵 AZUL — Papel y cartón: Periódicos, cajas, folios, revistas. Sin manchas de grasa ni restos de comida.\n\n🟢 VERDE — Vidrio: Solo botellas y tarros de vidrio. No cristal, ni cerámica, ni espejos.\n\n🟤 MARRÓN — Orgánico: Restos de comida, cáscaras, posos de café, plantas marchitas.\n\n⚫ GRIS — Resto: Todo lo que no encaja en los anteriores: pañales, colillas, polvo de aspiradora.',
            },
            {
                id: '2-2', title: 'Errores comunes al clasificar', duration: '7 min', icon: 'warning',
                content: '🚫 Los siguientes errores son MUY comunes:\n\n1. Meter servilletas y pañuelos en el azul → Van al marrón (orgánico) o gris (si están muy sucios).\n\n2. Tirar el cartón de pizza al azul → Si tiene grasa, va al orgánico. Si está limpio, al azul.\n\n3. Vasos y copas rotas al verde → El cristal NO es vidrio reciclable. Van al punto limpio o contenedor gris.\n\n4. Plásticos duros (juguetes, perchas) al amarillo → Solo envases van al amarillo. Plásticos que no sean envases van al punto limpio.\n\n5. Briks en el azul → Los briks (leche, zumo) van al amarillo porque son envases compuestos de cartón, plástico y aluminio.',
            },
            {
                id: '2-3', title: 'Plásticos: la guía definitiva', duration: '8 min', icon: 'flask',
                content: 'Los plásticos se clasifican con un número del 1 al 7:\n\n1️⃣ PET: Botellas de agua y refrescos. Muy reciclable.\n2️⃣ HDPE: Envases de leche, detergente, champú. Muy reciclable.\n3️⃣ PVC: Tuberías, marcos de ventanas. Difícil de reciclar.\n4️⃣ LDPE: Bolsas de supermercado, film transparente. Reciclable en algunos centros.\n5️⃣ PP: Tapones, envases de yogur, tuppers. Reciclable.\n6️⃣ PS: Poliestireno (corcho blanco), vasos desechables. Difícil de reciclar.\n7️⃣ Otros: Mezclas de plásticos. Generalmente NO reciclables.\n\n💡 Regla rápida: Si tiene el número 1, 2 o 5 → recíclalo con confianza.',
            },
            {
                id: '2-4', title: 'Metales y aluminio', duration: '6 min', icon: 'construct',
                content: 'El reciclaje de metales es uno de los más eficientes:\n\n🥫 Latas de aluminio: Se reciclan en 60 días. Son infinitamente reciclables sin perder calidad.\n\n🔩 Chatarra metálica: Electrodomésticos viejos, herramientas rotas → punto limpio.\n\n📊 Impacto: Reciclar una lata de aluminio ahorra suficiente energía para mantener un televisor encendido durante 3 horas.\n\n⚠️ Importante: Las latas NO necesitan estar perfectamente limpias. Con un enjuague rápido es suficiente. No desperdicies agua lavándolas a fondo.',
            },
            {
                id: '2-5', title: 'Papel y cartón: lo esencial', duration: '6 min', icon: 'newspaper',
                content: 'El papel puede reciclarse entre 5 y 7 veces antes de que sus fibras sean demasiado cortas.\n\n✅ SÍ se recicla: Periódicos, revistas, cajas de cartón, folios, sobres.\n\n❌ NO se recicla: Papel plastificado, papel de horno, papel fotográfico, papel con pintura o barniz, papel de aluminio.\n\n⚠️ Atención especial con los tickets de compra: La mayoría son de papel térmico y contienen BPA. Van al contenedor gris (resto), nunca al azul.\n\n💡 Tip: Aplana siempre las cajas de cartón antes de tirarlas. Ocupan menos espacio y facilitan el reciclaje.',
            },
            {
                id: '2-6', title: 'Vidrio vs. Cristal', duration: '5 min', icon: 'wine',
                content: 'Esta es una de las confusiones más frecuentes:\n\n🟢 VIDRIO (sí se recicla en el contenedor verde):\n• Botellas de vino, cerveza, refrescos\n• Tarros de mermelada, conservas\n• Frascos de perfume (sin tapón)\n\n🔴 CRISTAL (NO va al contenedor verde):\n• Vasos y copas\n• Espejos\n• Ventanas y cristales de gafas\n• Bombillas (excepto las LED)\n• Cerámica y porcelana\n\nEl cristal tiene una composición química diferente al vidrio y funde a temperaturas distintas. Si se mezclan, arruinan un lote entero de reciclaje.',
            },
            {
                id: '2-7', title: 'Residuos orgánicos', duration: '6 min', icon: 'nutrition',
                content: 'Los residuos orgánicos representan el 40% de la basura doméstica:\n\n🟤 Van al contenedor marrón:\n• Restos de frutas y verduras\n• Cáscaras de huevo\n• Posos de café y bolsitas de té\n• Flores marchitas y restos de poda pequeños\n• Servilletas y papel de cocina usados\n• Restos de comida cocinada\n\n❌ NO van al orgánico:\n• Aceite de cocina (punto limpio)\n• Pañales\n• Colillas\n• Corchos de plástico\n\n💡 Si compostas en casa, reduces tu basura orgánica un 100% y obtienes abono gratis para tus plantas.',
            },
            {
                id: '2-8', title: 'Residuos especiales y peligrosos', duration: '7 min', icon: 'alert-circle',
                content: 'Algunos residuos NUNCA deben ir a los contenedores normales:\n\n🔋 PILAS Y BATERÍAS: Contienen mercurio, cadmio y plomo. Deposítalas en los contenedores específicos de pilas (suelen estar en supermercados y tiendas de electrónica).\n\n💊 MEDICAMENTOS: Lleva los medicamentos caducados o sobrantes al punto SIGRE de tu farmacia.\n\n🖥️ ELECTRÓNICOS: Teléfonos, ordenadores, cargadores → punto limpio o tienda de electrónica.\n\n🛢️ ACEITE DE COCINA: Nunca por el desagüe (1 litro contamina 1,000 litros de agua). Recógelo en una botella y llévalo al punto limpio.\n\n🎨 PINTURAS Y DISOLVENTES: Punto limpio obligatorio. Son residuos peligrosos.',
            },
            {
                id: '2-9', title: 'Cómo preparar los residuos', duration: '5 min', icon: 'checkmark-done',
                content: 'Preparar bien los residuos antes de tirarlos mejora enormemente el reciclaje:\n\n1️⃣ VACIAR: Los envases deben estar vacíos. No hace falta lavarlos a fondo, solo vaciarlos.\n\n2️⃣ APLASTAR: Aplasta botellas y latas para que ocupen menos espacio.\n\n3️⃣ SEPARAR TAPONES: En muchos países los tapones se reciclan por separado.\n\n4️⃣ NO ANIDAR: No metas envases pequeños dentro de grandes → dificulta la separación automática.\n\n5️⃣ SIN BOLSA EN EL VIDRIO: Tira los vidrios directamente, sin bolsa de plástico.\n\n📌 Recuerda: Un contenedor mal separado puede contaminar un lote entero de reciclaje.',
            },
        ],
    },
    {
        id: '3',
        title: 'Compostaje Doméstico',
        description: 'Transforma residuos orgánicos en abono nutritivo para tus plantas',
        duration: '1h',
        level: 'Intermedio',
        gradient: Gradients.sunrise,
        icon: 'flower',
        xp: 120,
        category: 'advanced',
        lessons: [
            {
                id: '3-1', title: '¿Qué es el compostaje?', duration: '5 min', icon: 'leaf',
                content: 'El compostaje es la descomposición controlada de materia orgánica para crear abono natural llamado compost o humus.\n\nEs un proceso 100% natural que imita lo que ocurre en el suelo del bosque, donde las hojas caídas se descomponen y nutren la tierra.\n\n🌱 Beneficios:\n• Reduces tu basura orgánica (hasta un 40% de tu basura total)\n• Obtienes fertilizante orgánico gratis\n• Reduces emisiones de metano de los vertederos\n• Mejoras la salud de tu suelo y plantas\n\nNo necesitas un jardín grande. Incluso en un apartamento puedes compostar con vermicomposteras.',
            },
            {
                id: '3-2', title: 'Tipos de composteras', duration: '6 min', icon: 'cube',
                content: '📦 COMPOSTERA DE JARDÍN: Un contenedor abierto o cerrado en tu patio. Ideal para familias con jardín.\n\n🪱 VERMICOMPOSTERA: Usa lombrices rojas californianas para procesar residuos. Perfecta para pisos y apartamentos. Sin olores si se maneja bien.\n\n🗑️ BOKASHI: Método japonés de fermentación anaeróbica. Usa microorganismos para fermentar los residuos en un balde hermético. Acepta incluso carne y lácteos.\n\n🏡 COMPOSTAJE EN TUMBLER: Un barril giratorio que facilita voltear el compost. Produce compost más rápido (4-6 semanas).\n\n💡 Para empezar, la vermicompostera es la opción más versátil y apta para cualquier espacio.',
            },
            {
                id: '3-3', title: 'Materiales verdes y marrones', duration: '6 min', icon: 'color-fill',
                content: 'El secreto del buen compost es equilibrar dos tipos de materiales:\n\n🟢 MATERIALES VERDES (Nitrógeno):\n• Restos de frutas y verduras\n• Posos de café\n• Césped recién cortado\n• Plantas frescas\nSon húmedos y se descomponen rápido.\n\n🟤 MATERIALES MARRONES (Carbono):\n• Hojas secas\n• Cartón sin tinta (cortado en trozos)\n• Servilletas de papel\n• Ramas pequeñas\n• Aserrín\nSon secos y aportan estructura.\n\n⚖️ La proporción ideal es 3 partes de marrones por 1 parte de verdes. Si huele mal → más marrones. Si no se descompone → más verdes.',
            },
            {
                id: '3-4', title: 'Paso a paso: primer compost', duration: '7 min', icon: 'list',
                content: '🏗️ Construye tu primera compostera en 30 minutos:\n\n1. Elige tu contenedor (caja de madera, cubo con agujeros, o compostera comercial)\n2. Coloca una capa base de ramitas o cartón cortado (drenaje)\n3. Añade una primera capa de materiales marrones (hojas secas)\n4. Agrega materiales verdes (restos de cocina del día)\n5. Cubre con otra capa de marrones\n6. Humedece ligeramente (como una esponja exprimida)\n7. Repite el proceso cada vez que añadas residuos\n\n⏱️ VOLTEA el compost cada 1-2 semanas con una pala o tenedor\n📅 En 2-3 meses tendrás tu primer compost listo\n\n✅ Sabrás que está listo cuando huela a tierra de bosque húmeda y tenga un color oscuro uniforme.',
            },
            {
                id: '3-5', title: 'Problemas y soluciones', duration: '6 min', icon: 'build',
                content: '🐛 MOSCAS DE LA FRUTA: Cubre siempre los restos con una capa de marrones. Las moscas no atraviesan cartón o hojas secas.\n\n🦨 MAL OLOR: Significa exceso de humedad o de verdes. Añade más materiales marrones y voltea la pila.\n\n🐜 HORMIGAS: La pila está demasiado seca. Riega ligeramente.\n\n🐀 ROEDORES: Nunca pongas carne, lácteos o aceite en compost abierto (sí en bokashi). Usa compostera cerrada.\n\n❄️ SE DETIENE EN INVIERNO: Normal. Los microorganismos se ralentizan con el frío. La descomposición se reanuda en primavera.\n\n🟡 COMPOST AMARILLO/SECO: Falta agua y verdes. Añade restos frescos de cocina y riega.',
            },
            {
                id: '3-6', title: 'Usando tu compost', duration: '5 min', icon: 'trending-up',
                content: '🌱 Tu compost terminado se puede usar de muchas formas:\n\n🪴 MACETAS: Mezcla 1 parte de compost con 3 partes de tierra para macetas.\n\n🌿 JARDÍN: Esparce una capa de 2-3 cm sobre la superficie del suelo alrededor de tus plantas.\n\n🌾 HUERTO: Mezcla con la tierra al plantar. Es el mejor fertilizante orgánico.\n\n💧 TÉ DE COMPOST: Mete compost en un saco de tela, sumérgelo en agua 24-48 horas. Usa el líquido como fertilizante líquido.\n\n📊 Valor: Un saco de compost orgánico comercial cuesta entre 5-15€. ¡Tú lo produces gratis con tu basura!',
            },
        ],
    },
    {
        id: '4',
        title: 'Reciclaje de Electrónicos',
        description: 'Maneja tus dispositivos de forma responsable y segura',
        duration: '35 min',
        level: 'Avanzado',
        gradient: Gradients.aurora,
        icon: 'phone-portrait',
        xp: 200,
        category: 'advanced',
        lessons: [
            {
                id: '4-1', title: '¿Qué son los e-waste?', duration: '5 min', icon: 'desktop',
                content: 'Los residuos electrónicos (e-waste o RAEE) son todos los dispositivos eléctricos y electrónicos que han llegado al final de su vida útil.\n\n📱 Ejemplos: Teléfonos, tablets, laptops, monitores, impresoras, cargadores, cables, pilas, baterías, electrodomésticos pequeños.\n\n🌍 El problema global:\n• Se generan 50 millones de toneladas de e-waste al año\n• Solo el 20% se recicla correctamente\n• Contienen materiales tóxicos: plomo, mercurio, cadmio\n• Pero también contienen materiales valiosos: oro, plata, cobre, paladio\n\n💰 Dato: Un millón de teléfonos móviles reciclados pueden recuperar 16 toneladas de cobre, 350 kg de plata, y 34 kg de oro.',
            },
            {
                id: '4-2', title: 'Peligros de los e-waste', duration: '6 min', icon: 'skull',
                content: '☠️ Los electrónicos contienen sustancias altamente tóxicas:\n\n🔴 PLOMO: Presente en soldaduras de circuitos. Daña el sistema nervioso y los riñones.\n\n🟡 CADMIO: En baterías recargables antiguas. Cancerígeno reconocido.\n\n🔵 MERCURIO: En pantallas LCD y interruptores. Daña el cerebro y los pulmones.\n\n🟠 RETARDANTES DE LLAMA: En plásticos de carcasas. Disruptores endocrinos.\n\n⚠️ Cuando los electrónicos terminan en vertederos:\n• Los tóxicos se filtran al suelo y agua subterránea\n• Si se queman, liberan dioxinas al aire\n• En países en desarrollo, niños desmontan electrónicos a mano sin protección\n\nPor eso es CRUCIAL llevarlos a puntos de recogida autorizados.',
            },
            {
                id: '4-3', title: 'Cómo preparar tus electrónicos', duration: '5 min', icon: 'shield-checkmark',
                content: 'Antes de reciclar cualquier dispositivo electrónico:\n\n🔐 SEGURIDAD DE DATOS:\n1. Haz copia de seguridad de lo que necesites\n2. Cierra sesión de todas tus cuentas\n3. Restablece a valores de fábrica\n4. Retira la tarjeta SIM y tarjetas de memoria\n5. En PCs: formatea el disco duro o destrúyelo físicamente\n\n🔋 BATERÍAS:\n• Si es removible, retírala y recíclala por separado\n• Si está hinchada, NO la manipules, llévala directamente al punto de recogida\n\n📦 ACCESORIOS:\n• Cargadores, cables y auriculares también son e-waste\n• Agrúpalos en una bolsa para facilitar la recogida',
            },
            {
                id: '4-4', title: '¿Dónde reciclar electrónicos?', duration: '5 min', icon: 'location',
                content: '📍 Puntos de recogida de RAEE:\n\n🏪 TIENDAS DE ELECTRÓNICA: Por ley, en la UE y en muchos países, las tiendas deben aceptar tu dispositivo viejo al comprar uno nuevo (recogida 1x1).\n\n🏛️ PUNTOS LIMPIOS: Instalaciones municipales que aceptan todo tipo de residuos especiales. Busca el más cercano en tu ayuntamiento.\n\n📦 SERVICIOS DE RECOGIDA: Muchas marcas (Apple, Samsung, Dell) tienen programas de reciclaje con recogida a domicilio gratuita.\n\n🤝 DONACIÓN: Si el dispositivo aún funciona, considera donarlo a ONGs, escuelas o programas de inclusión digital.\n\n💡 Tip: Nunca deposites electrónicos en contenedores de basura normales. Es ilegal en muchos países.',
            },
            {
                id: '4-5', title: 'Alargar la vida de tus dispositivos', duration: '5 min', icon: 'battery-charging',
                content: 'La mejor forma de reducir e-waste es alargar la vida útil de tus dispositivos:\n\n🔋 BATERÍA:\n• No dejes tu teléfono cargando toda la noche\n• Mantén la carga entre 20% y 80%\n• Evita temperaturas extremas\n\n📱 SOFTWARE:\n• Actualiza el sistema operativo regularmente\n• Elimina apps que no uses\n• Limpia la caché periódicamente\n\n🛡️ PROTECCIÓN FÍSICA:\n• Usa funda y protector de pantalla\n• Limpia los puertos con aire comprimido\n\n🔧 REPARACIÓN:\n• Antes de comprar nuevo, busca talleres de reparación\n• El movimiento "Right to Repair" lucha por hacer las reparaciones más accesibles\n\n📊 Dato: Usar tu teléfono un año más reduce su huella de carbono un 25-30%.',
            },
            {
                id: '4-6', title: 'Economía circular electrónica', duration: '5 min', icon: 'sync-circle',
                content: '♻️ La economía circular busca eliminar el concepto de "basura":\n\n🔄 MODELO LINEAL (actual): Extraer → Fabricar → Usar → Tirar\n🔄 MODELO CIRCULAR (ideal): Diseñar → Fabricar → Usar → Reparar → Reutilizar → Reciclar → Diseñar\n\n🏢 Empresas que lideran:\n• Fairphone: Teléfonos modulares diseñados para ser reparados\n• Framework: Laptops donde puedes cambiar cada componente\n• Patagonia: Programa "Worn Wear" para reparar y revender\n\n🌍 Tu acción: Antes de comprar algo nuevo, pregúntate:\n1. ¿Realmente lo necesito?\n2. ¿Puedo comprarlo de segunda mano?\n3. ¿El fabricante ofrece programa de reciclaje?\n4. ¿Es reparable?\n\n🎓 ¡Felicidades! Has completado el curso de Reciclaje Electrónico.',
            },
        ],
    },
];

export const FEATURED_ARTICLES = [
    {
        id: '1',
        title: '10 Errores Comunes al Reciclar',
        readTime: '5 min',
        gradient: ['#FF6B6B', '#FF8E8E'],
        emoji: '🚫',
        content: '¿Sabías que muchos de nosotros reciclamos mal sin saberlo? Aquí están los 10 errores más comunes:\n\n1️⃣ Meter servilletas usadas en el contenedor azul: Están contaminadas con comida, van al orgánico.\n\n2️⃣ Tirar el cartón de pizza al papel: Si tiene grasa, va al orgánico.\n\n3️⃣ Poner vasos rotos en el contenedor de vidrio: El cristal (vasos, copas) NO es vidrio reciclable.\n\n4️⃣ Reciclar bolsas de plástico en el amarillo: Van en el contenedor, no dentro de otra bolsa.\n\n5️⃣ Tirar juguetes de plástico al amarillo: Solo envases van ahí. Los juguetes van al punto limpio.\n\n6️⃣ No vaciar los envases antes de reciclarlos: Un envase con restos contamina todo el lote.\n\n7️⃣ Meter briks en el azul: Los briks son envases compuestos y van al amarillo.\n\n8️⃣ Tirar tickets de compra al azul: Son papel térmico con BPA. Van al resto (gris).\n\n9️⃣ Poner cápsulas de café en el orgánico: Las de aluminio van al amarillo, las compostables al marrón.\n\n🔟 Reciclar cuando el contenedor está lleno: Si dejas tu basura encima del contenedor, probablemente acabe en el suelo y no se recicle.\n\n💡 La regla de oro: Cuando dudes, es mejor tirarlo al contenedor gris (resto) que contaminar un contenedor de reciclaje entero.',
    },
    {
        id: '2',
        title: 'El Futuro del Plástico',
        readTime: '8 min',
        gradient: ['#4ECDC4', '#45B7AF'],
        emoji: '🔮',
        content: 'El plástico es uno de los mayores desafíos ambientales de nuestra era. Pero la ciencia está avanzando.\n\n📊 LA SITUACIÓN ACTUAL:\n• Se producen 400 millones de toneladas de plástico al año\n• Solo el 9% se recicla a nivel mundial\n• 8 millones de toneladas llegan a los océanos cada año\n• El plástico tarda entre 100 y 1000 años en degradarse\n\n🔬 INNOVACIONES PROMETEDORAS:\n\n🦠 Plástico comestible por enzimas: Científicos japoneses descubrieron en 2016 una bacteria (Ideonella sakaiensis) que literalmente se come el PET. Ya se están desarrollando enzimas sintéticas que descomponen botellas de plástico en horas.\n\n🌿 Bioplásticos: Hechos de maíz, caña de azúcar o algas. Algunos son compostables en condiciones industriales. Pero ojo: "biodegradable" no siempre significa "compostable en tu jardín".\n\n🧱 Plástico como material de construcción: Empresas en Colombia y Kenia están creando ladrillos y adoquines a partir de plástico reciclado. Son más resistentes y baratos que los convencionales.\n\n♻️ Reciclaje químico: A diferencia del reciclaje mecánico (que degrada la calidad), el reciclaje químico rompe el plástico a nivel molecular y lo reconstruye como nuevo.\n\n🌍 TU PAPEL:\n• Reduce tu consumo de plástico de un solo uso\n• Lleva tu propia bolsa, botella y cubiertos\n• Elige productos con envases reciclables (PET 1, HDPE 2)\n• Apoya marcas que usan plástico reciclado (rPET)',
    },
    {
        id: '3',
        title: 'Economía Circular Explicada',
        readTime: '6 min',
        gradient: ['#A78BFA', '#8B5CF6'],
        emoji: '♻️',
        content: 'La economía circular es un modelo económico que busca eliminar el concepto de "basura" por completo.\n\n📐 MODELO LINEAL (cómo funciona hoy):\nExtraer recursos → Fabricar productos → Usar → Tirar\nEste modelo es insostenible. Usamos 1.7 planetas Tierra al año.\n\n🔄 MODELO CIRCULAR (el objetivo):\nDiseñar → Fabricar → Usar → Reparar → Reutilizar → Reciclar → Rediseñar\n\nLos 5 principios clave:\n\n1️⃣ DISEÑAR SIN RESIDUOS: Los productos se diseñan pensando en su fin de vida desde el principio. Fáciles de desmontar, reparar y reciclar.\n\n2️⃣ MATERIALES EN CICLO: Los materiales biológicos vuelven a la tierra (compost). Los materiales técnicos (metales, plásticos) se reciclan infinitamente.\n\n3️⃣ ENERGÍA RENOVABLE: Todo el sistema funciona con energía limpia.\n\n4️⃣ PRODUCTO COMO SERVICIO: En vez de comprar una lavadora, pagas por "lavados". La empresa mantiene y recicla la máquina.\n\n5️⃣ COLABORACIÓN: Empresas, gobiernos y ciudadanos trabajan juntos.\n\n🏢 Ejemplos reales:\n• IKEA: Programa de recompra de muebles usados\n• Patagonia: Repara tu ropa gratis en sus tiendas\n• Loop: Envases reutilizables para productos del supermercado\n• Too Good To Go: Rescata comida que iba a tirarse\n\n💚 Tu acción: Pregúntate antes de cada compra: ¿Puedo alquilarlo? ¿Comprarlo de segunda mano? ¿Cuánto durará?',
    },
];

export const RESOURCES = [
    { id: '1', title: 'Guía de Símbolos de Reciclaje', type: 'PDF', size: '2.4 MB', icon: 'document-text', color: Palette.red.main, downloads: 1234 },
    { id: '2', title: 'Directorio de Puntos Limpios', type: 'PDF', size: '1.8 MB', icon: 'map', color: Palette.blue.main, downloads: 856 },
    { id: '3', title: 'Calendario de Recolección', type: 'PDF', size: '0.5 MB', icon: 'calendar', color: Palette.green.main, downloads: 2341 },
    { id: '4', title: 'Infografía: Tiempo de Degradación', type: 'Imagen', size: '1.2 MB', icon: 'image', color: Palette.purple.main, downloads: 3567 },
];

export const CATEGORIES = [
    { key: 'all', label: 'Todo', icon: 'grid', color: Palette.green.main },
    { key: 'basics', label: 'Básicos', icon: 'leaf', color: Palette.green.main },
    { key: 'advanced', label: 'Avanzado', icon: 'rocket', color: Palette.blue.main },
    { key: 'tips', label: 'Tips', icon: 'bulb', color: Palette.yellow.dark },
];
