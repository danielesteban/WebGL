const fs = require('fs');
const path = require('path');
const { deflateSync } = require('zlib');
// eslint-disable-next-line import/no-extraneous-dependencies
const OBJFile = require('obj-file-parser');

const input = `${process.argv[2]}.obj`;
const output = path.join(__dirname, '..', 'src', 'models', `${process.argv[2]}.bin`);
const {
  models,
} = (new OBJFile(fs.readFileSync(input).toString('utf8'))).parse();
const model = models.filter(({ faces, vertices }) => (
  !!faces.length && !!vertices.length
))[0];
if (!model) {
  process.exit(1);
}
const {
  faces,
  vertices,
  vertexNormals,
} = model;
const normals = [];
const indices = faces.reduce((indices, { vertices }) => {
  let face;
  if (vertices.length === 4) {
    face = [
      vertices[0].vertexIndex - 1,
      vertices[1].vertexIndex - 1,
      vertices[2].vertexIndex - 1,
      vertices[2].vertexIndex - 1,
      vertices[3].vertexIndex - 1,
      vertices[0].vertexIndex - 1,
    ];
  } else {
    face = vertices.map(({ vertexIndex }) => (vertexIndex - 1));
  }
  if (vertexNormals) {
    vertices.forEach(({ vertexIndex, vertexNormalIndex }) => {
      normals[vertexIndex - 1] = vertexNormals[vertexNormalIndex - 1];
    });
  }
  indices.push(...face);
  return indices;
}, []);
const position = vertices.reduce((position, { x, y, z }) => {
  position.push(x, y, z);
  return position;
}, []);
const normal = normals.reduce((normal, { x, y, z }) => {
  normal.push(x, y, z);
  return normal;
}, []);

fs.writeFileSync(output, deflateSync(Buffer.concat([
  Buffer.from((new Uint16Array([indices.length])).buffer),
  Buffer.from((new Uint16Array(indices)).buffer),
  Buffer.from((new Uint16Array([position.length])).buffer),
  Buffer.from((new Float32Array(position)).buffer),
  Buffer.from((new Float32Array(normal)).buffer),
])));
