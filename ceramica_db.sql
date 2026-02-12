-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-08-2025 a las 23:01:18
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ceramica_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_items`
--

CREATE TABLE `carrito_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `date_added` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrito_items`
--

INSERT INTO `carrito_items` (`id`, `user_id`, `session_id`, `product_id`, `quantity`, `date_added`) VALUES
(4, NULL, '5ba0224b485fc02669112e7a81277640', 5, 1, '2025-06-01 04:06:19'),
(12, NULL, 'b3355e433f01adec19d06f1cfcc97828', 7, 1, '2025-06-02 21:30:14'),
(19, NULL, '1368c098ce09b6b3afb74dc066244af7', 11, 3, '2025-06-02 22:45:16'),
(20, NULL, '1368c098ce09b6b3afb74dc066244af7', 10, 2, '2025-06-02 22:45:19'),
(21, NULL, '1368c098ce09b6b3afb74dc066244af7', 9, 2, '2025-06-02 22:45:21'),
(25, NULL, '58b3a3903542411ba68606fcfc44f052', 1, 1, '2025-06-03 23:42:44'),
(30, NULL, '438c1fd94a66fbb71fc75623171b1b72', 9, 1, '2025-06-04 02:33:10'),
(36, NULL, '65366857840c87ad929422fbbcd66604', 6, 1, '2025-08-22 03:14:06'),
(37, NULL, '65366857840c87ad929422fbbcd66604', 13, 1, '2025-08-22 03:15:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `Id_Catego` int(4) NOT NULL,
  `Cat_Catego` varchar(21) NOT NULL,
  `Fecha_Produccion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`Id_Catego`, `Cat_Catego`, `Fecha_Produccion`) VALUES
(1, 'Decoración', '2025-04-22'),
(2, 'Vajilla', '2025-04-07'),
(3, 'Jardín', '2025-04-20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `Id_Cli` int(4) NOT NULL,
  `Nom_Cli` varchar(21) NOT NULL,
  `ApellidoP_Cli` varchar(11) NOT NULL,
  `ApellidoM_Cli` varchar(11) DEFAULT NULL,
  `Gen_Cli` varchar(1) DEFAULT NULL,
  `fecha_de_visita` date DEFAULT NULL,
  `Edad_Cli` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`Id_Cli`, `Nom_Cli`, `ApellidoP_Cli`, `ApellidoM_Cli`, `Gen_Cli`, `fecha_de_visita`, `Edad_Cli`) VALUES
(1, 'Juan', 'Perez', 'Duran', 'M', '2025-03-19', 19),
(2, 'Maria', 'Sanchez', 'Duran', 'F', '2025-04-03', 23),
(3, 'Frida', 'Hernandez', 'Alvarado', 'F', '2025-04-13', 20),
(4, 'Angel', 'Salinas', 'Perez', 'M', '2025-02-12', 18);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `Id_Con` int(4) NOT NULL,
  `Tel_Con` bigint(11) NOT NULL,
  `Calle_Con` varchar(20) NOT NULL,
  `Num_Con` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `contactos`
--

INSERT INTO `contactos` (`Id_Con`, `Tel_Con`, `Calle_Con`, `Num_Con`) VALUES
(1, 6566162666, 'Siempre Viva', 2333),
(2, 6561766080, 'Puerto Obaldia', 1421),
(3, 9152503034, 'Indio', 4724);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones_envio`
--

CREATE TABLE `direcciones_envio` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nombre_completo` varchar(255) NOT NULL,
  `calle_numero` varchar(255) NOT NULL,
  `colonia` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `codigo_postal` varchar(10) NOT NULL,
  `pais` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `es_predeterminada` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direcciones_envio`
--

INSERT INTO `direcciones_envio` (`id`, `user_id`, `nombre_completo`, `calle_numero`, `colonia`, `ciudad`, `estado`, `codigo_postal`, `pais`, `telefono`, `es_predeterminada`, `fecha_creacion`) VALUES
(1, 1, 'Angel Salinas Perez', 'Av. Teófilo Borunda No. 6632', 'Jarudo del Norte', 'Cd Juarez', 'Chihuahua', '32652', 'México', '6565553080', 1, '2025-06-02 03:22:57'),
(2, 2, 'Ronal S', 'Calle falsa 1160', 'roma', 'juarez', 'chihuahua', '32616', 'México', '6561203808', 1, '2025-06-04 02:35:17'),
(3, 3, 'Sacaria Flores del Campo', 'lomas turbas 888', 'springfield', 'ciudad gotica', 'soltero', '40000', 'México', '00000000', 1, '2025-08-22 03:21:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `Id_Emp` int(4) NOT NULL,
  `Nom_Emp` varchar(21) NOT NULL,
  `ApellidoP_Emp` varchar(11) NOT NULL,
  `ApellidoM_Emp` varchar(11) DEFAULT NULL,
  `Tel_Emp` bigint(11) NOT NULL,
  `Edad_Emp` int(2) NOT NULL,
  `Gen_Emp` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`Id_Emp`, `Nom_Emp`, `ApellidoP_Emp`, `ApellidoM_Emp`, `Tel_Emp`, `Edad_Emp`, `Gen_Emp`) VALUES
(1, 'Dario', 'Rojas', 'Cruz', 6567564611, 20, 'M'),
(2, 'Alejandro', 'Aceves', 'Cazares', 6561191926, 19, 'M'),
(3, 'Angel', 'Muela', 'Dueñez', 6142562611, 25, 'M');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tipo_tarjeta` varchar(50) NOT NULL,
  `numero_tarjeta_completo` varchar(16) NOT NULL,
  `fecha_expiracion` varchar(5) NOT NULL,
  `nombre_titular` varchar(255) NOT NULL,
  `es_predeterminado` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodos_pago`
--

INSERT INTO `metodos_pago` (`id`, `user_id`, `tipo_tarjeta`, `numero_tarjeta_completo`, `fecha_expiracion`, `nombre_titular`, `es_predeterminado`, `fecha_creacion`) VALUES
(1, 1, 'Mastercard', '5468684143893795', '02/23', 'Angel Perez', 0, '2025-06-02 03:02:26'),
(3, 1, 'Mastercard', '5465877514063450', '04/33', 'Angel Salinas Perez', 1, '2025-06-02 03:14:45'),
(4, 1, 'Mastercard', '5418676895496117', '04/27', 'Juan Perez', 0, '2025-06-02 22:08:30'),
(5, 2, 'Mastercard', '5198791504743001', '04/25', 'Ranal', 1, '2025-06-04 02:36:04'),
(6, 3, 'Mastercard', '2394789287194739', '02/80', 'Alan brito delgado', 1, '2025-08-22 03:23:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `metodo_pago_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha_pedido` datetime DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `user_id`, `direccion_id`, `metodo_pago_id`, `total`, `fecha_pedido`, `estado`) VALUES
(4, 1, 1, 4, 520.00, '0000-00-00 00:00:00', 'enviado'),
(5, 1, 1, 4, 15.00, '2025-06-03 17:43:21', 'pendiente'),
(6, 1, 1, 1, 50.00, '2025-06-03 17:43:59', 'pendiente'),
(7, 1, 1, 4, 140.00, '2025-06-03 17:48:19', 'pendiente'),
(8, 2, 2, 5, 70.00, '2025-06-03 20:36:30', 'pendiente'),
(9, 2, 2, 5, 45.00, '2025-06-03 20:37:13', 'pendiente'),
(10, 1, 1, 3, 105.00, '2025-06-05 16:30:23', 'pendiente'),
(11, 3, 3, 6, 95.00, '2025-08-21 21:24:25', 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos_items`
--

CREATE TABLE `pedidos_items` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price_at_purchase` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos_items`
--

INSERT INTO `pedidos_items` (`id`, `pedido_id`, `product_id`, `quantity`, `price_at_purchase`) VALUES
(5, 4, 1, 2, 35.00),
(6, 4, 7, 1, 45.00),
(7, 4, 11, 3, 85.00),
(8, 4, 10, 2, 30.00),
(9, 4, 9, 2, 45.00),
(10, 5, 12, 1, 15.00),
(11, 6, 3, 1, 50.00),
(12, 7, 3, 1, 50.00),
(13, 7, 9, 2, 45.00),
(14, 8, 6, 1, 25.00),
(15, 8, 9, 1, 45.00),
(16, 9, 7, 1, 45.00),
(17, 10, 1, 3, 35.00),
(18, 11, 7, 1, 45.00),
(19, 11, 3, 1, 50.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `Id_Prod` int(4) NOT NULL,
  `Nom_Prod` varchar(50) NOT NULL,
  `Catego_Prod` varchar(10) NOT NULL,
  `Precio_Prod` decimal(5,0) NOT NULL,
  `Stock_Prod` int(5) DEFAULT NULL,
  `description` varchar(500) NOT NULL,
  `image_url` varchar(40) NOT NULL,
  `oferta` varchar(2) NOT NULL,
  `tipo_ofeta` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`Id_Prod`, `Nom_Prod`, `Catego_Prod`, `Precio_Prod`, `Stock_Prod`, `description`, `image_url`, `oferta`, `tipo_ofeta`) VALUES
(1, 'Jarron de Ceramica', 'vajillas', 35, 12, 'Jarrón de cerámica para guardar lo que quieras desde líquidos hasta otras cosas.', 'img/jarron.png', 'NO', ''),
(2, 'Plato de Ceramica', 'vajillas', 45, 25, 'Plato de cerámica duradero y hermoso.', 'img/plato.png', 'NO', ''),
(3, 'Maceta de Ceramica', 'jardin', 50, 10, 'Excelente maceta de cerámica para tus plantas y flores.', 'img/maceta.png', 'NO', ''),
(5, 'Vajilla de Ceramica', 'vajillas', 250, 30, 'Juego de vajilla de cerámica completo, diseñado para realzar la experiencia en tu mesa.', 'img/vajilla.png', 'NO', ''),
(6, 'Taza de Ceramica', 'vajillas', 25, 200, 'Taza de cerámica artesanal, perfecta para disfrutar de tus bebidas favoritas.', 'img/taza.jpeg', 'NO', ''),
(7, 'Piso de Ceramica', 'decoracion', 45, 100, 'Piso de cerámica de alta calidad, ideal para crear ambientes elegantes y duraderos.', 'img/R.jpeg', 'NO', ''),
(8, 'Porta Incienso Cerámica', 'decoracion', 12, 100, 'Este porta incienso de cerámica, de diseño compacto y elegante, es ideal para crear un ambiente de calma y relajación en cualquier espacio. Su base estable y su fácil limpieza lo convierten en el complemento perfecto para tus momentos de meditación o simplemente para aromatizar tu hogar.', 'img/porta_incienso.png', 'SI', '10 OFF'),
(9, 'Tetera de Cerámica Japonesa', 'vajillas', 45, 50, 'Experimenta la auténtica ceremonia del té con esta tetera tradicional japonesa de cerámica. Incluye un filtro de acero inoxidable para una infusión perfecta y su diseño clásico aporta un toque de serenidad a tu ritual diario del té. Ideal para amantes de la cultura japonesa y las infusiones de calidad.', 'img/tetera_japonesa.png', 'SI', '25 OFF'),
(10, 'Set de Platos Postre (4)', 'vajillas', 30, 120, 'Este juego de cuatro platos pequeños de cerámica es perfecto para servir postres individuales, aperitivos o tapas. Con acabados modernos y una resistencia excepcional, son aptos para lavavajillas y microondas, combinando funcionalidad y estilo en tu mesa.', 'img/platos_postre.png', 'SI', '15 OFF'),
(11, 'Lámpara de Mesa Cerámica', 'decoracion', 85, 30, 'Añade un toque de calidez y sofisticación a cualquier habitación con esta lámpara de mesa. Su base de cerámica esculpida, con detalles artísticos, y su pantalla de tela difunden una luz suave y acogedora, creando un ambiente relajante y elegante en tu espacio.', 'img/lampara_ceramica.png', 'SI', '20 OFF'),
(12, 'Jabonera de Cerámica Artesanal', 'baño', 15, 90, 'Esta jabonera de baño de cerámica, hecha a mano, es una solución práctica y estética para tu jabón sólido. Su diseño inteligente facilita el drenaje del agua, manteniendo el jabón seco y prolongando su vida útil, a la vez que decora tu lavabo con un toque artesanal.', 'img/jabonera_artesanal.png', 'SI', '5 OFF'),
(13, 'Figurilla Decorativa de Cerámica', 'decoracion', 28, 70, 'Una pequeña figurilla de cerámica con un diseño abstracto y contemporáneo, perfecta para añadir un detalle artístico a tus estanterías, escritorios o mesas auxiliares. Es una pieza única que captura la atención y complementa cualquier estilo decorativo moderno.', 'img/figurilla_decorativa.png', 'SI', '10 OFF');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_destacados`
--

CREATE TABLE `productos_destacados` (
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `stock_quantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos_destacados`
--

INSERT INTO `productos_destacados` (`product_id`, `name`, `description`, `price`, `image_url`, `category`, `stock_quantity`) VALUES
(1, 'Jarron de Ceramica', 'Jarrón de cerámica hecho a mano, una pieza decorativa que añade un toque artístico a tu hogar. Su diseño único y esmaltado brillante lo convierten en el centro de atención de cualquier espacio.', 125.00, 'img/jarron.png', 'vajillas', 50),
(5, 'Vajilla de Ceramica', 'Juego de vajilla de cerámica completo, diseñado para realzar la experiencia en tu mesa. Con un estilo rústico y a la vez moderno, es ideal tanto para el uso diario como para ocasiones especiales.', 250.00, 'img/vajilla.png', 'vajillas', 30),
(6, 'Taza de Ceramica', 'Taza de cerámica artesanal, perfecta para disfrutar de tu café o té. Con un diseño cómodo y una capacidad ideal, es el complemento perfecto para tus momentos de relax.', 25.00, 'img/taza.jpeg', 'vajillas', 200),
(7, 'Piso de Ceramica', 'Piso de cerámica de alta calidad, ideal para crear ambientes elegantes y duraderos. Su superficie pulida es fácil de limpiar y resistente al desgaste diario, perfecto para cualquier tipo de tráfico.', 45.00, 'img/R.jpeg', 'decoracion', 100);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `Id_Prov` int(4) NOT NULL,
  `Nom_Prov` varchar(10) NOT NULL,
  `Correo_Prov` varchar(30) NOT NULL,
  `Tel_Prov` bigint(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`Id_Prov`, `Nom_Prov`, `Correo_Prov`, `Tel_Prov`) VALUES
(1, 'Mamolin', 'contacto@mamolin.com', 6561207290),
(2, 'Oxxo', 'contacto@oxxo.com', 6564209992),
(3, 'Cemex', 'cemex@gmail.com', 6562504886),
(4, 'Pemex', 'pemex@gmail.com', 6143599292);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `Id_Ubi` int(4) NOT NULL,
  `Cod_Ubi` int(5) NOT NULL,
  `Calle_Ubi` varchar(21) NOT NULL,
  `Num_Ubi` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`Id_Ubi`, `Cod_Ubi`, `Calle_Ubi`, `Num_Ubi`) VALUES
(1, 3259, 'Siempre Viva', 921),
(2, 1001, 'Jarudo', 2751),
(3, 1002, 'Oro', 3251),
(4, 1001, 'Petroleo', 2333);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_sesion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `contrasena`, `fecha_registro`, `ultima_sesion`) VALUES
(1, 'Angel Salinas Perez', 'angeldesingscontact@gmail.com', '$2y$12$zkij./D1rMt8nt6DTnOCku5npuiE7GczSaz8mPdSgnCcr6PT49lcC', '2025-06-01 04:17:07', '2025-06-05 22:27:45'),
(2, 'ranal', 'ranal@gmail.com', '$2y$12$4wOaK9z68EzHeGY8CvACvu2r0u48sX7tp2wkfmOBoBtDtt6Z9Xeta', '2025-06-04 02:33:57', '2025-06-04 02:34:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`Id_Catego`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`Id_Cli`);

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`Id_Con`);

--
-- Indices de la tabla `direcciones_envio`
--
ALTER TABLE `direcciones_envio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`Id_Emp`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `direccion_id` (`direccion_id`),
  ADD KEY `metodo_pago_id` (`metodo_pago_id`);

--
-- Indices de la tabla `pedidos_items`
--
ALTER TABLE `pedidos_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`Id_Prod`);

--
-- Indices de la tabla `productos_destacados`
--
ALTER TABLE `productos_destacados`
  ADD PRIMARY KEY (`product_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`Id_Prov`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`Id_Ubi`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `Id_Catego` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `Id_Cli` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `Id_Con` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `direcciones_envio`
--
ALTER TABLE `direcciones_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `Id_Emp` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `pedidos_items`
--
ALTER TABLE `pedidos_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `Id_Prod` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `productos_destacados`
--
ALTER TABLE `productos_destacados`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `Id_Prov` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `Id_Ubi` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD CONSTRAINT `carrito_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `productos` (`Id_Prod`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `direcciones_envio`
--
ALTER TABLE `direcciones_envio`
  ADD CONSTRAINT `direcciones_envio_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD CONSTRAINT `metodos_pago_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones_envio` (`id`),
  ADD CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`);

--
-- Filtros para la tabla `pedidos_items`
--
ALTER TABLE `pedidos_items`
  ADD CONSTRAINT `pedidos_items_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `pedidos_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `productos` (`Id_Prod`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
