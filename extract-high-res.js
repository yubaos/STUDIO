const fs = require('fs');
const path = require('path');
const topology = require('topojson-client');
const simplify = require('topojson-simplify');

// 读取高精度的 10m 数据
const worldData = require('world-atlas/countries-10m.json');

// 目标国家/地区的 ISO N3 代码
const targetCodes = ['764', '458', '344']; // 泰国，马来西亚，中国香港

// 过滤出只包含目标国家的几何体
const filteredObjects = {};
for (const [key, geometry] of Object.entries(worldData.objects.countries.geometries)) {
  if (geometry.id && targetCodes.includes(geometry.id.toString())) {
    filteredObjects[key] = geometry;
  }
}

// 创建新的 Topology 对象，只包含需要的几何体
const newTopology = {
  type: 'Topology',
  transform: worldData.transform,
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: Object.values(filteredObjects)
    }
  },
  arcs: worldData.arcs
};

// 简化几何体，但保持较高精度 (1e-7 比默认的更精确)
const simplifiedTopology = simplify.simplify(newTopology, 1e-7);

// 输出结果
const output = JSON.stringify(simplifiedTopology);
fs.writeFileSync('public/countries-10m-high-res.json', output);

console.log('✓ 高精度地图数据已生成');
console.log(`  - 文件大小: ${(Buffer.byteLength(output, 'utf8') / 1024).toFixed(2)} KB`);
console.log(`  - 包含国家/地区: ${Object.keys(filteredObjects).length} 个`);
console.log(`  - 弧段数量: ${simplifiedTopology.arcs.length} 个`);
