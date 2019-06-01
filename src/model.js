import pako from 'pako';

function FetchModel(url) {
  return fetch(url)
    .then(res => res.arrayBuffer())
    .then((deflated) => {
      const { buffer } = pako.inflate(new Uint8Array(deflated));
      let offset = 0;
      const indexCount = new Uint16Array(buffer, offset, 1)[0];
      offset += Uint16Array.BYTES_PER_ELEMENT;
      const index = new Uint16Array(buffer, offset, indexCount);
      offset += Uint16Array.BYTES_PER_ELEMENT * indexCount;
      const vertexCount = new Uint16Array(buffer, offset, 1)[0];
      offset += Uint16Array.BYTES_PER_ELEMENT;
      const position = new Float32Array(buffer, offset, vertexCount);
      offset += Float32Array.BYTES_PER_ELEMENT * vertexCount;
      const normal = new Float32Array(buffer, offset, vertexCount);
      return {
        index,
        position,
        normal,
      };
    });
}

export default FetchModel;
