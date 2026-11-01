# Guía y Manifiesto de Grabación de Audio para GlaciAgua

Este directorio contiene las grabaciones de audio en **Español Andino** (`/audio/es/`) y **Quechua Ancashino / Huaylas** (`/audio/qu/`) diseñadas para usuarios con baja alfabetización, adultos mayores y quechuahablantes en la Cordillera Blanca (Áncash, Perú).

---

## ⚠️ Regla de Oro del Sistema de Audio
1. **Quechua (`qu`)**: Si el archivo `.mp3` **no** existe en `public/audio/qu/`, el botón «Escuchar» se **oculta automáticamente**. **NUNCA** se ejecuta un sintetizador de voz (TTS) ni se reproduce audio en español cuando el usuario está en quechua.
2. **Español (`es`)**: Si el `.mp3` no existe, se utiliza el sintetizador de voz del navegador (`es-PE`) a ritmo pausado (0.95x). Si existe el `.mp3`, se reproduce la voz humana grabada.

---

## 🎙️ Pautas Técnicas para las Grabaciones Comunitarias
- **Voz sugerida**: Una persona de la comunidad (de preferencia mujer o comunero con voz clara, tono cálido, pausado y respetuoso, estilo facilitador de salud o directivo comunal).
- **Formato de archivo**: `.mp3` (o `.ogg` / `.wav` convertido a mp3).
- **Frecuencia / Canales**: 44.1 kHz, **Mono** (1 canal), bitrate entre 64 kbps y 128 kbps.
- **Peso máximo recomendado**: Menos de 400 KB por archivo (la mayoría dura entre 8 y 25 segundos).
- **Condiciones**: Habitación cerrada sin eco ni viento. Dejar 0.5 segundos de silencio al inicio y al final.

---

## 📋 Inventario Completo de Archivos Requeridos

### 1. Bienvenida e Inicio
* **Archivo:** `bienvenida_inicio.mp3`
* **Duración aprox.:** 12 - 15 s
* **Guión en Español (`es/`):**
  > «¡Bienvenido a GlaciAgua! Esta aplicación te ayuda a saber si el agua de tu quebrada tiene minerales o acidez para proteger a tu familia y tus animales. Si tienes dudas, toca en cualquier momento el botón azul con el signo de interrogación para escuchar la guía con dibujos.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «¡Allillanchu! GlaciAgua-man shamushqa kanki. Kay yanapakuyqa willashunki mayupa yakun mineralniyuq o puka kaykashqanta, aylluykikunata y uywaykikunata cuidananpaq. Imatapis musyariyta munarqa, takiy tsay azul «?» botonta dibuhukunata rikanaykipaq.»

---

### 2. ¿Puedo usar el agua? (Semáforo y Gotas)
* **Archivo:** `ayuda_paso1_semaforo.mp3`
* **Duración aprox.:** 18 - 22 s
* **Guión en Español (`es/`):**
  > «¿Cómo saber si el agua es de riesgo? Mira los tres colores y las caritas de la gota: Verde con carita sonriente: menor riesgo de acidez, trátala según te indique tu JASS. Amarillo con carita preocupada: precaución, puede tener minerales. Rojo con carita enferma: ¡alerta, agua ácida! Evita beberla o darla a los animales y avisa a tu junta.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «¿Imanotaq musyashun yaku sasakayta? Rikay kimsa llimpikunata y yakupa qaqunta: Qumyaq kushishqa: yaku allilla, JASS nisqanta kasuy. Qellu yarpachakushqa: paqwata rikay, mineralnillan kaykanman. Puka qeshyaq: ¡yaku puka! Ama upyeytsu ni uywakunaman qoytsu, jass-nikita willay.»

---

### 3. Advertencia Crítica: ¡No hervir el agua ácida!
* **Archivos:** `ayuda_paso2_nohervir.mp3` *(y alias: `aviso_hervir.mp3`, `alerta_hervir_olla.mp3`)*
* **Duración aprox.:** 16 - 20 s
* **Guión en Español (`es/`):**
  > «¡Aviso muy importante de salud! Si el agua de tu quebrada baja ácida o anaranjada, ¡no la hiervas! Hervir el agua no elimina los metales de las rocas; solo evapora el agua y concentra más el veneno. Usa agua de un manantial seguro o cisterna, y avisa de inmediato a tu JASS o posta médica.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «¡Alli willakuy kawaynikipaq! Yaku puka o qanra urpamuptinqa, ¡ama timputsitsu! Timputsiptikiqa qanran mana yarquntsu, aswanmi kallpanchan venenonta. Huk allin puquymanta yakuta apamuy o JASS cisterna shuyay, willay postata.»

---

### 4. Cómo mandar un aviso de agua sucia
* **Archivo:** `ayuda_paso3_avisar.mp3`
* **Duración aprox.:** 15 - 18 s
* **Guión en Español (`es/`):**
  > «¿Cómo avisar si el agua baja sucia? Toca el botón amarillo «Avisar agua sucia». Si puedes, tómale una foto al agua, elige la figura del color que viste (rojo o turbio) y presiona Enviar. No necesitas saber escribir mucho; tu aviso alertará a toda la comunidad.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «¿Imanotaq willakushun yaku qanra urpamuptin? Qellu «Avisar agua sucia» botonta takiy. Munarqa fotota horquy, dibuhupa llimpinta akray y «Kachay» nisqanta takiy. Mana qellqayta yacharpis willakunkim llapan ayllukunata.»

---

### 5. Funcionamiento sin conexión a Internet
* **Archivo:** `ayuda_paso4_offline.mp3`
* **Duración aprox.:** 14 - 17 s
* **Guión en Español (`es/`):**
  > «¿GlaciAgua funciona si no hay internet en la puna? ¡Sí! Toda la información y el semáforo se guardan en tu celular. Tus avisos se quedan guardados seguros y, cuando bajes al pueblo o llegue la señal, se enviarán automáticamente a las autoridades.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «¿Punakunachaw internet illaptinpis llamkanraqtsu? ¡Aw, llamkanmi! Llapan semaforokuna celularllaykicho waqaychan. Willakushqaykikuna seguros karkanqa, markaman chaptiki o señal shamuptin kikillan apakanqa.»

---

### 6. Estados de las 4 Quebradas Piloto

#### A) Cuenca Quillcay (Huaraz)
* **Archivo:** `quebrada_quillcay.mp3`
* **Guión en Español (`es/`):**
  > «Microcuenca Quillcay en Huaraz. El semáforo está en amarillo: precaución. Sus quebradas como Cojup y Auquiscocha reciben aguas de deshielo que pueden variar su calidad. No tomes agua cruda y sigue las indicaciones de tu junta de agua.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «Quillcay mayu, Warascho. Semaforon qelluchaw kaykan: paqwata rikay. Cojup mayupis Auquiscochapis rasumanta yakuta apamun. Ama mana allichasqa yakuta upyaytsu, JASS-ta kasuy.»

#### B) Cuenca Canray Chico (Olleros)
* **Archivo:** `quebrada_canray_chico.mp3`
* **Guión en Español (`es/`):**
  > «Microcuenca Canray Chico en Olleros. El semáforo está en verde: menor riesgo de acidez según las mediciones disponibles. Sus bofedales ayudan a filtrar el agua. Recuerda tratarla siempre según recomiende tu junta local.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «Canray Chico mayu, Uyllurucho. Semaforon qumyaqchaw kaykan: yaku allilla kaykan. Oqshakuna allitam yakuta limpiayan. JASS nisqannolla yakuta allichay.»

#### C) Cuenca Pachacoto (Cátac)
* **Archivo:** `quebrada_pachacoto.mp3`
* **Guión en Español (`es/`):**
  > «Microcuenca Pachacoto en Cátac. El semáforo está en rojo: alerta por drenaje ácido de roca. Quebradas como Pastoruri y Pumapampa presentan agua ácida con metales. Evita usarla para beber o para el ganado y coordina con tu comunidad.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «Pachacoto mayu, Katakcho. Semaforon pukachaw kaykan: ¡alerta, yaku puka! Pastoruri mayuwan Pumapampa mayu qanra mineralta apamun. Ama upyaytsu ni uywakunata qoytsu, directivota willay.»

#### D) Cuenca Río Blanco (Recuay)
* **Archivo:** `quebrada_rio_blanco.mp3`
* **Guión en Español (`es/`):**
  > «Microcuenca Río Blanco en Recuay. El semáforo está en rojo: alta acidez y presencia de metales disueltos. No es recomendable para consumo humano ni regar cultivos sensibles. Usa fuentes seguras y consulta al municipio.»
* **Propuesta en Quechua Ancashino (`qu/`):**
  > «Río Blanco mayu, Reqwacho. Semaforon pukachaw kaykan: yaku sinchi qanra. Ama runapaq ni chakra papapaq apaytsu. Huk yakuta ashiy y municipiota willay.»

---

### 7. Pasos del Reporte Comunitario

* **`step_location.mp3`**
  - *Español:* «Paso 1: Confirma en qué quebrada estás o toca el botón para fijar con tu GPS.»
  - *Quechua:* «Huk kaq rikay: Mayqan mayuchow kaykanki, o takiy GPS nisqanta saywakunanpaq.»

* **`step_color.mp3`**
  - *Español:* «Paso 2: Toca el dibujo que más se parezca al color del agua: anaranjada, blanca o clara.»
  - *Quechua:* «Ishkay kaq rikay: Dibuhuta akray yakupa llimpinman: puka, yuraq o chunkayuq.»

* **`step_photo.mp3`**
  - *Español:* «Paso 3: Si puedes hacerlo con seguridad sin caerte al río, toma una foto del agua.»
  - *Quechua:* «Kimsa kaq rikay: Ama mayuman chankaytsu, manchakuy illaptin fotota horquy.»

* **`step_send.mp3`**
  - *Español:* «Paso 4: Toca el botón verde para guardar y enviar tu aviso a la comunidad.»
  - *Quechua:* «Chusku kaq rikay: Qumyaq botonta takiy willakushqaykita kachaypaq.»
