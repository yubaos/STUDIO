const fs = require('fs');
const path = require('path');

// 读取高精度的 10m 数据
const worldData = require('world-atlas/countries-10m.json');

// 目标国家/地区的 ISO N3 代码
const targetCodes = ['764', '458', '344']; // 泰国，马来西亚，中国香港

// 找出所有需要的弧段索引
const neededArcIndices = new Set();

for (const geometry of worldData.objects.countries.geometries) {
  if (geometry.id && targetCodes.includes(geometry.id.toString())) {
    // 收集该几何体引用的所有弧段索引
    const collectArcs = (arcs) => {
      if (Array.isArray(arcs)) {
        for (const arc of arcs) {
          if (Array.isArray(arc)) {
            collectArcs(arc);
          } else if (typeof arc === 'number') {
            const idx = arc < 0 ? ~arc : arc;
            neededArcIndices.add(idx);
          }
        }
      }
    };
    collectArcs(geometry.arcs);
  }
}

// 创建弧段索引映射：原索引 -> 新索引
const arcIndexMap = new Map();
let newIndex = 0;
for (const idx of neededArcIndices) {
  arcIndexMap.set(idx, newIndex++);
}

// 提取需要的弧段坐标数据
const newArcs = [];
for (const oldIdx of neededArcIndices) {
  newArcs.push(worldData.arcs[oldIdx]);
}

// 过滤并重新映射几何体
const newGeometries = [];
for (const geometry of worldData.objects.countries.geometries) {
  if (geometry.id && targetCodes.includes(geometry.id.toString())) {
    // 重新映射弧段索引
    const remapArcs = (arcs) => {
      if (Array.isArray(arcs)) {
        return arcs.map(arc => {
          if (Array.isArray(arc)) {
            return remapArcs(arc);
          } else if (typeof arc === 'number') {
            const isNegative = arc < 0;
            const absIdx = isNegative ? ~arc : arc;
            const mappedIdx = arcIndexMap.get(absIdx);
            return isNegative ? ~mappedIdx : mappedIdx;
          }
          return arc;
        });
      }
      return arcs;
    };
    
    newGeometries.push({
      type: geometry.type,
      arcs: remapArcs(geometry.arcs),
      id: geometry.id,
      properties: geometry.properties || {}
    });
  }
}

// 创建新的 Topology 对象
const newTopology = {
  type: 'Topology',
  transform: worldData.transform,
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: newGeometries
    }
  },
  arcs: newArcs
};

// 输出结果
const output = JSON.stringify(newTopology);
fs.writeFileSync('footprint-map/data/countries-selected-high-res.json', output);

console.log('✓ 高精度地图数据已正确生成');
console.log(`  - 文件大小: ${(Buffer.byteLength(output, 'utf8') / 1024).toFixed(2)} KB`);
console.log(`  - 包含国家/地区: ${newGeometries.length} 个`);
console.log(`  - 弧段数量: ${newArcs.length} 个`);
console.log(`  - 弧段索引映射数: ${arcIndexMap.size}`);
