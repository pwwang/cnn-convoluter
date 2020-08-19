/**
 * All the math needed for cnn-convoluter
 * */

// product of an array
export const prod = array => array.reduce((x, y) => x*y, 1);
const sum = array => array.reduce((x, y) => x+y, 0);
const mean = array => sum(array) / array.length;

// a range of numbers
const range = len => [...Array(len).keys()];

// random number between min and max (included)
const randInt = (min, max) => Math.floor((Math.random() * (max - min + 1) + min));

// incremental index to coordinates
// incr: 0-based
export const incrToCoords = (incr, size) => {
    // using byte-operation?
    const coords = [];
    incr += 1;
    incr = incr % prod(size);

    let rest = incr;
    for (let i = 0; i < size.length; i++) {
        if (i === size.length - 1) {
            coords.push(rest);
        } else {
            const restSize = prod(size.slice(i + 1));
            coords.push(Math.floor(rest / restSize));
            rest = rest % restSize;
        }
    }

    return coords;
};

const sizeCheck = (size) => {
    if (!(size instanceof Array)) {
        size = [size];
    }
    size = size.filter(s => s !== undefined);
    if (size.length > 3) {
        throw "Only support <= 3d";
    }
    return size;
};

export class Matrix {

    static preset(size, n=undefined) {
        size = sizeCheck(size);

        const num = () => typeof(n) === 'function' ? n() : n;
        let data;
        if (size.length === 1) {
            data = Array.from({length: size[0]}, num);
        } else if (size.length === 2) {
            data = Array.from({length: size[0]}, () => Array.from(
                {length: size[1]}, num
            ));
        } else {
            data = Array.from({length: size[0]}, () => Array.from(
                {length: size[1]}, () => Array.from(
                    {length: size[2]}, num
                )
            ));
        }
        return new Matrix(data);
    }

    static random(size, min=0, max=9) {
        return Matrix.preset(size, () => randInt(min, max));
    }

    static zeros(size) {
        return Matrix.preset(size, 0);
    }

    static ones(size) {
        return Matrix.preset(size, 1);
    }

    static create(data) {
        return new Matrix(data);
    }

    static fromString(strdata) {
        let ret;
        if (strdata.includes("\n---\n")) {
            const splitdata = strdata.split("\n---\n");
            ret = splitdata.map(line => line.split("\n").filter(
                line => !!line.trim()
            ).map(line => line.split(/\s+/).map(
                d => {
                    d = parseInt(d);
                    if (isNaN(d)) {
                        throw "Only integers are allowed";
                    }
                    return d;
                }
            )));
            return new Matrix(ret);
        } else {
            ret = strdata.split("\n").filter(d => !!d.trim()).map(
                line => line.split(/\s+/).map(
                    d => {
                        d = parseInt(d);
                        if (isNaN(d)) {
                            throw "Only integers are allowed";
                        }
                        return d;
                    }
                )
            );
            return new Matrix(ret);
        }
    }

    constructor(data) {
        this.data = data;
        this.size = [];
        let elem = data;
        while (elem instanceof Array) {
            this.size.push(elem.length);
            elem = elem[0];
        }
    }

    first() {
        let ret = this.data;
        while (ret instanceof Array) {
            ret = ret[0];
        }
        return ret;
    }

    get(coords) {
        if (coords.length !== this.size.length) {
            throw `Coordinate dimensionality mismatch, expect ${this.size.length}D, got ${coords.length}D.`;
        }
        coords = coords.map((coord, i) => {
            if (!(coord instanceof Array))
                coord = [coord];
            if (coord[0] >= this.size[i])
                throw `Coordinate out of bounds: ${coord[0]} (expect < ${this.size[i]})`;
            return coord;
        });
        return this.subset(coords).first();
    }

    set(coords, data) {
        if (coords.length !== this.size.length) {
            throw `Coordinate dimensionality mismatch, expect ${this.size.length}D, got ${coords.length}D.`;
        }
        coords = coords.map((coord, i) => {
            if (!(coord instanceof Array))
                coord = [coord];
            if (coord[0] >= this.size[i])
                throw `Coordinate out of bounds: ${coord[0]} (expect < ${this.size[i]})`;
            return coord;
        });

        if (!(data instanceof Array) && !(data instanceof Matrix)) {
            data = Matrix.create([data]);
        } else if (!(data instanceof Matrix)) {
            data = Matrix.create([data]);
        }
        data.reshape(Array(coords.length).fill(1), true);

        this.replace(coords, data, true);
        return this;
    }

    subset(indexes) {
        if (indexes.length < this.size.length) {
            throw `Dimension mismatch in subset, expect ${this.size.length}, got ${indexes.length}`;
        }
        indexes = indexes.slice(indexes.length - this.size.length);
        indexes = indexes.map(i => i instanceof Array ? i : [i]);

        let data;
        if (this.size.length === 1) {
            data = this.data.filter((_, i) => indexes[0].includes(i));
        } else if (this.size.length === 2) {
            data = this.data.filter((_, i) => indexes[0].includes(i)).map(
                dat => dat.filter((_, j) => indexes[1].includes(j))
            );
        } else {
            data = this.data.filter((_, i) => indexes[0].includes(i)).map(
                dat => dat.filter((_, j) => indexes[1].includes(j)).map(
                    da => da.filter((_, k) => indexes[2].includes(k))
                )
            );
        }

        return new Matrix(data);
    }

    replace(indexes, data, inplace=true) {
        // console.trace();
        if (indexes.length < this.size.length) {
            throw `Dimensionality mismatch, expect ${this.size.length}, got ${indexes.length}`;
        }
        indexes = indexes.slice(indexes.length - this.size.length);
        indexes = indexes.map(i => i instanceof Array ? i : [i]);

        if (data instanceof Matrix) {
            data = data.data;
        }

        const mdata = Matrix.create(data);
        if (indexes.map(i => i.length).toString() !== mdata.size.toString()) {
            throw `Dimension mismatch in replace, expect ${indexes.map(i => i.length)}, got ${mdata.size}`;
        }
        let newdata = inplace ? this.data : JSON.parse(JSON.stringify(this.data));

        if (this.size.length === 1) {
            indexes[0].forEach((idx, i) => {
                if (idx >= this.size[0])
                    throw `Index out of bound: ${idx} (expect < ${this.size[0]}) at dim 0.`
                newdata[idx] = data[i];
            });
        } else if (this.size.length === 2) {
            indexes[0].forEach((idx1, i1) => {
                if (idx1 >= this.size[0])
                    throw `Index out of bound: ${idx1} (expect < ${this.size[0]}) at dim 0.`
                indexes[1].forEach((idx2, i2) => {
                    if (idx2 >= this.size[1])
                        throw `Index out of bound: ${idx2} (expect < ${this.size[1]}) at dim 1.`
                    newdata[idx1][idx2] = data[i1][i2];
                })
            });
        } else {
            indexes[0].forEach((idx1, i1) => {
                if (idx1 >= this.size[0])
                    throw `Index out of bound: ${idx1} (expect < ${this.size[0]}) at dim 0.`
                indexes[1].forEach((idx2, i2) => {
                    if (idx2 >= this.size[1])
                        throw `Index out of bound: ${idx2} (expect < ${this.size[1]}) at dim 1.`
                    indexes[2].forEach((idx3, i3) => {
                        if (idx3 >= this.size[2])
                            throw `Index out of bound: ${idx3} (expect < ${this.size[2]}) at dim 2.`
                        newdata[idx1][idx2][idx3] = data[i1][i2][i3];
                    })
                })
            });
        }
        if (inplace) {
            return this;
        }
        return new Matrix(newdata);
    }

    pad(padding, type='zero') {
        if (this.size.length !== padding.length) {
            throw `Dimension mismatch in pad, expect ${this.size.length}, got ${padding.length}`;
        }

        const newsize = this.size.map((s, i) => s + padding[i] * 2);
        const indexes = newsize.map((idx, i) => range(idx).slice(
            padding[i], idx - padding[i]
        ));
        const ret = Matrix.zeros(newsize);
        ret.replace(indexes, this.data, true);

        return ret;
    }

    unpad(padding) {
        if (this.size.length !== padding.length) {
            throw `Dimension mismatch in unpad, expect ${this.size.length}, got ${padding.length}`;
        }
        const indexes = this.size.map((idx, i) => range(idx).slice(
            padding[i], idx - padding[i]
        ));

        return this.subset(indexes);
    }

    resize(size, fill='zero', inplace=true) {
        size = sizeCheck(size);

        if (size.length !== this.size.length) {
            throw `Should only resize at the same dimensionality (expect ${this.size.length}, got ${size.length}).`;
        }

        let ret;
        if (fill === 'zero') {
            ret = Matrix.zeros(size);
        } else { // random
            ret = Matrix.random(size, fill.min, fill.max);
        }

        const replaceSize = size.map((s, i) => range(Math.min(s, this.size[i])));
        ret.replace(replaceSize, this.subset(replaceSize), inplace=true);
        if (inplace) {
            this.data = ret.data;
            this.size = ret.size;
            return this
        }
        return ret;
    }

    reshape(shape, inplace=true) {
        if (prod(this.size) !== prod(shape)) {
            throw `Unequal total length, expect ${prod(this.size)}, got ${prod(shape)}`;
        }

        let data = this.flatten();
        if (shape.length === 2) {
            data = range(shape[0]).map(i => data.slice(i * shape[1], (i+1) * shape[1]));
        } else if (shape.length === 3) {
            data = range(shape[0] * shape[1]).map(
                i => data.slice(i * shape[2], (i+1) * shape[2])
            );
            data = range(shape[0]).map(i => data.slice(i * shape[1], (i+1) * shape[1]));
        }

        if (inplace) {
            this.data = data;
            this.size = shape;
            return this;
        }
        return new Matrix(data);
    }

    dilate(dilation) {
        if (dilation.length !== this.size.length) {
            throw `Dimensionality mismatch, expect ${this.size.length}, got ${dilation.length}`;
        }
        const dsize = this.size.map((s, i) => dilation[i] * (s-1) + 1);
        const ret = Matrix.zeros(dsize);
        const replaceIndexes = this.size.map((size, i) => range(size).map(s => s * dilation[i]));
        return ret.replace(replaceIndexes, this.data, false);
    }

    stringify() {
        if (this.size.length === 1) {
            return this.data.join(" ");
        }
        if (this.size.length === 2) {
            return this.data.map(d => d.join(" ")).join("\n");
        }
        return this.data.map(line => line.map(d => d.join(" ")).join("\n")).join("\n---\n");
    }

    mulsum(other) {
        if (!other instanceof Matrix) {
            throw `Must mulsum a Matrix, got ${typeof(other)} instead.`;
        }
        if (this.size.toString() != other.size.toString()) {
            throw `Size mismatch, expect ${this.size}, got ${other.size}.`;
        }
        let ret = 0;
        for (let i = 0; i < prod(this.size); i++) {
            const coords = incrToCoords(i, this.size);
            let elem1 = this.data;
            let elem2 = other.data;
            for (let coord of coords) {
                elem1 = elem1[coord];
                elem2 = elem2[coord];
            }
            ret += elem1 * elem2;
        }
        return ret;
    }

    forEach(callFunc) {
        if (this.size.length === 1) {
            for (let x of Array(this.size[0]).keys()) {
                callFunc(this.data[x], x);
            }
        } else if (this.size.length === 2) {
            for (let x of Array(this.size[0]).keys()) {
                for (let y of Array(this.size[1]).keys()) {
                    callFunc(this.data[x][y], x, y);
                }
            }
        } else {
            for (let x of Array(this.size[0]).keys()) {
                for (let y of Array(this.size[1]).keys()) {
                    for (let z of Array(this.size[2]).keys()) {
                        callFunc(this.data[x][y][z], x, y, z);
                    }
                }
            }
        }
    }

    map(callFunc) {
        const ret = this.copy();
        if (this.size.length === 1) {
            for (let x of Array(this.size[0]).keys()) {
                ret.data[x] = callFunc(this.data[x], x);
            }
        } else if (this.size.length === 2) {
            for (let x of Array(this.size[0]).keys()) {
                for (let y of Array(this.size[1]).keys()) {
                    ret.data[x][y] = callFunc(this.data[x][y], x, y);
                }
            }
        } else {
            for (let x of Array(this.size[0]).keys()) {
                for (let y of Array(this.size[1]).keys()) {
                    for (let z of Array(this.size[2]).keys()) {
                        ret.data[x][y][z] = callFunc(this.data[x][y][z], x, y, z);
                    }
                }
            }
        }
        return ret;
    }

    conv(padding, kernel, dilation, stride, type='conv') {
        // expecting a result where we have input coord <=> output coord mappings
        // as well as the mulsum number
        if (!(kernel instanceof Matrix))
            kernel = Matrix.create(kernel);

        if (kernel.size.length !== this.size.length)
            throw `Dimensionality mismatch, input data is ${this.size.length}D, but kernel is ${kernel}.size.length}D.`;

        if (stride.length !== this.size.length)
            throw `Stride dimensionality mismatch, expect ${this.size.length}, got ${stride.length}`;

        return new Convolution(this, padding, kernel, dilation, stride, type);
    }

    flatten() {
        // return this.data.flat(2);
        return [].concat.apply([], [].concat.apply([], this.data));
    }

    min() {
        if (this.size.length === 1)
            return Math.min(...this.data);
        if (this.size.length === 2)
            return Math.min(...this.data.map(d => Math.min(...d)));
        return Math.min(...this.data.map(d2 => Math.min(...d2.map(d => Math.min(...d)))));
    }

    max() {
        if (this.size.length === 1)
            return Math.max(...this.data);
        if (this.size.length === 2)
            return Math.max(...this.data.map(d => Math.max(...d)));
        return Math.max(...this.data.map(d2 => Math.max(...d2.map(d => Math.max(...d)))));
    }

    mean() {
        return mean(this.flatten());
    }

    copy() {
        return new Matrix(JSON.parse(JSON.stringify(this.data)));
    }

    equals(other) {
        if (!(other instanceof Matrix))
            return false;
        return JSON.stringify(this.data) === JSON.stringify(other.data);
    }

}

class Convolution {
    // a convoluted object, that enables queries from either input
    // or output coordinates, together with the results
    constructor(data, padding, kernel, dilation, stride, type='conv') {
        this.data = data.pad(padding); // in + 2*padding
        this.padding = padding;
        this.kernel = kernel.dilate(dilation); // dilation * (kernel - 1) + 1
        this.dilation = dilation;
        this.stride = stride;
        this.type = type;
        // see: https://pytorch.org/docs/master/generated/torch.nn.Conv1d.html
        // out = Math.floor(  (in + 2*padding - (dilation * (kernel - 1) + 1)) / stride + 1  )
        const outSize = this.data.size.map((s, i) => Math.floor( (s - this.kernel.size[i]) / this.stride[i] + 1 ));
        // output => Matrix([<results>])
        this.output = Matrix.zeros(outSize);
        this._convolute();
    }

    _convolute() {
        this.output = this.output.map((_, ...coords) => {
            const inblock = this.inCoordsToBlockIndexes(this.outCoordsToIn(coords));
            if (this.type === 'conv') {
                return this.data.subset(inblock).mulsum(this.kernel);
            } else if (this.type === 'maxpool') {
                return this.data.subset(inblock).max();
            } else if (this.type === 'avgpool') {
                return Number(this.data.subset(inblock).mean()).toFixed(1);
            }
        });
    }

    inCoordsToOut(coords) {
        // convert input coordinates to output coordinates
        return coords.map((coord, i) =>
            Math.floor(Math.min(coord, this.data.size[i] - this.kernel.size[i]) / this.stride[i])
        )
    }

    outCoordsToIn(coords) {
        return coords.map((coord, i) => coord * this.stride[i]);
    }

    inCoordsToBlockIndexes(coords, withAll=true) {
        // turn input start coordinates to indexes of the blocks which
        // are able to subset the input data to convolve.
        const inStarts = this.outCoordsToIn(this.inCoordsToOut(coords));
        if (withAll) {
            return this.kernel.size.map((ks, i) =>
                range(ks).map(k => k + inStarts[i])
            );
        } else {
            // return only cells that are involved in calculation
            // without dilated cells
            return this.kernel.size.map((ks, i) =>
                range(Math.ceil(ks/this.dilation[i])).map(k => k * this.dilation[i] + inStarts[i])
            );
        }
    }
}

//// tests
/**
class Test {
    constructor() {
        this.index = 0;
        this.total = 0;
        this.passed = 0;
        this.group = 'Ungrouped';
    }

    groupStart(group, resetIndex=true) {
        this.group = group;
        if (resetIndex) this.index = 0;
    }

    groupEnd(resetIndex=true) {
        this.group = 'Ungrouped';
        if (resetIndex) this.index = 0;
    }

    done() {
        console.log('-----------------------')
        console.log(`TOTAL: ${this.total}, PASSED: ${this.passed}, FAILED: ${this.total - this.passed}.`)
    }

    logPass(mark, msg) {
        this.passed ++;
        mark = !!mark ? `: ${mark}` : '';
        msg = !!msg ? `: ${msg}` : '';
        console.info(`v PASSED: ${this.group}-${this.index}${mark}${msg}`);
    }

    logFail(mark, msg) {
        mark = !!mark ? `: ${mark}` : '';
        msg = !!msg ? `: ${msg}` : '';
        console.error(`x FAILED: ${this.group}-${this.index}${mark}${msg}`);
    }

    assertEqual(a, b, mark) {
        this.total ++;
        this.index ++;
        a === b ? this.logPass(mark) : this.logFail(mark, `${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
    }

    assertArrayEqual(a, b, mark) {
        this.total ++;
        this.index ++;
        JSON.stringify(a) === JSON.stringify(b) ?
            this.logPass(mark) :
            this.logFail(mark, `${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
    }

    assertIncludes(a, b, mark) {
        this.total ++;
        this.index ++;
        a.includes(b) ? this.logPass(mark) : this.logFail(mark, `!${JSON.stringify(a)}.includes(${JSON.stringify(b)})`);
    }

    assertThrow(callable, error, mark) {
        this.total ++;
        this.index ++;
        let fail = true;
        try{
            callable();
        } catch(e) {
            if (e.match(error)) {
                fail = false;
                this.logPass(mark);
            }
        }
        if (fail) {
            this.logFail(mark, `No error with ${error} thrown.`);
        }
    }

    assertTrue(cond, mark) {
        this.total ++;
        this.index ++;
        cond ? this.logPass(mark) : this.logFail(mark, `${cond} is not true`);
    }
}

const test = new Test();

test.groupStart('prod');
test.assertEqual(prod([1,2,3]), 6);
test.assertEqual(prod([1]), 1);
test.assertEqual(prod([0,1,2]), 0);

test.groupStart('sum');
test.assertEqual(sum([1,2,3]), 6);
test.assertEqual(sum([1]), 1);
test.assertEqual(sum([0,1,2]), 3);

test.groupStart('mean');
test.assertEqual(mean([1,2,3]), 2);
test.assertEqual(mean([1]), 1);
test.assertEqual(mean([0,1,2]), 1);
test.assertEqual(mean([0,1,2,3]), 1.5);

test.groupStart('range');
test.assertArrayEqual(range(4), [0,1,2,3]);
test.assertArrayEqual(range(0), []);

test.groupStart('randInt');
let ri = randInt(0, 0);
test.assertEqual(ri, 0);
ri = randInt(0, 0);
test.assertEqual(ri, 0);
ri = randInt(0, 0);
test.assertEqual(ri, 0);
ri = randInt(0, 1);
test.assertIncludes([0, 1], ri);
ri = randInt(0, 1);
test.assertIncludes([0, 1], ri);
ri = randInt(0, 1);
test.assertIncludes([0, 1], ri);

test.groupStart('incrToCoords');
test.assertArrayEqual(incrToCoords(0, [1]), [0], 'zero-incr');
test.assertArrayEqual(incrToCoords(8, [8]), [1], 'dim-equal');
test.assertArrayEqual(incrToCoords(9, [8]), [2], 'dim-greater');
test.assertArrayEqual(incrToCoords(9, [1, 8]), [0, 2], 'dim-greater-2d');
test.assertArrayEqual(incrToCoords(9, [2, 8]), [1, 2], 'dim-greater-more');

test.groupStart('sizeCheck');
test.assertArrayEqual(sizeCheck(1), [1]);
test.assertArrayEqual(sizeCheck([2,3,undefined]), [2,3]);
test.assertThrow(() => sizeCheck([1,2,3,4]), /Only support/);
test.assertArrayEqual(sizeCheck([1,2,3]), [1,2,3]);

test.groupStart('Matrix-preset');
test.assertArrayEqual(Matrix.preset(1, 1).data, [1]);
test.assertArrayEqual(Matrix.preset(1, 1).size, [1]);
test.assertArrayEqual(Matrix.preset([1,2], ()=>9).data, [[9, 9]]);
test.assertArrayEqual(Matrix.preset([1,2,3], 1).data, [[[1,1,1], [1,1,1]]]);

test.groupStart('Matrix-random');
test.assertArrayEqual(Matrix.random([1], 0, 0).data, [0]);
test.assertArrayEqual(Matrix.random([1], 1, 1).data, [1]);
test.assertArrayEqual(Matrix.random([1]).size, [1]);
test.assertArrayEqual(Matrix.random([1,2]).size, [1,2]);
test.assertArrayEqual(Matrix.random([1,2,3]).size, [1,2,3]);

test.groupStart('Matirx-zeros');
test.assertArrayEqual(Matrix.zeros([1,2,3]).data, [[[0,0,0], [0,0,0]]]);

test.groupStart('Matirx-ones');
test.assertArrayEqual(Matrix.ones([1,2,3]).data, [[[1,1,1], [1,1,1]]]);

test.groupStart('Matrix-create/equals');
test.assertTrue(Matrix.create([1,2,3]).equals(new Matrix([1,2,3])));

test.groupStart('Matrix-fromString');
test.assertTrue(Matrix.fromString("1 2 3").equals(new Matrix([[1,2,3]])), "Matrix from '1 2 3'");
test.assertTrue(Matrix.fromString("1 2 3\n---\n4 5 6").equals(new Matrix([[[1,2,3]], [[4, 5, 6]]])));

test.groupStart('matrix-first');
test.assertEqual(Matrix.create([3,2,1]).first(), 3);
test.assertEqual(Matrix.create([3]).first(), 3);

test.groupStart('matrix-subset');
test.assertArrayEqual(Matrix.create([1,2,3]).subset([[1,2]]).data, [2,3]);
test.assertArrayEqual(Matrix.create([[1,2,3], [4,5,6], [7,8,9]]).subset([[1,2], [2]]).data, [[6], [9]]);
test.assertArrayEqual(Matrix.create([
    [[1,2,3], [4,5,6]], // 2 x 2 x 3
    [[7,8,9], [0,4,6]]
]).subset([[1], [1], [1,2]]).data, [[[4,6]]]);

test.groupStart('matrix-replace-1d');
let mat = Matrix.create([1,2,3]);
test.assertArrayEqual(mat.replace([[1,2]], [4,5], inplace=false).data, [1,4,5]);
test.assertArrayEqual(mat.data, [1,2,3]);
test.assertArrayEqual(mat.replace([[1,2]], [4,5], inplace=true).data, [1,4,5]);
test.assertArrayEqual(mat.data, [1,4,5]);

test.groupStart('matrix-replace-2d');
mat = Matrix.create([[1,2,3], [4,5,6]]);
test.assertArrayEqual(mat.replace([[0, 1], [1]], [[7],[8]], inplace=false).data, [[1,7,3],[4,8,6]]);
test.assertArrayEqual(mat.data, [[1,2,3], [4,5,6]]);
test.assertArrayEqual(mat.replace([[0, 1], [1]], [[7],[8]], inplace=true).data, [[1,7,3],[4,8,6]]);
test.assertArrayEqual(mat.data, [[1,7,3], [4,8,6]]);

test.groupStart('matrix-replace-3d');
mat = Matrix.create([[[1,2,3]], [[4,5,6]], [[7,8,9]]]);
test.assertArrayEqual(mat.size, [3, 1, 3]);
test.assertArrayEqual(
    mat.replace([[0, 1], [0], [2]], [[[7]], [[8]]], inplace=false).data,
    [[[1,2,7]], [[4,5,8]], [[7,8,9]]]
);
test.assertArrayEqual(mat.data, [[[1,2,3]], [[4,5,6]], [[7,8,9]]]);
test.assertArrayEqual(mat.replace([[0, 1], [0], [2]], [[[7]], [[8]]], inplace=true).data,
    [[[1,2,7]], [[4,5,8]], [[7,8,9]]]
);
test.assertArrayEqual(mat.data, [[[1,2,7]], [[4,5,8]], [[7,8,9]]], 'this changed');

test.groupStart('matrix-pad/unpad-1d');
mat = Matrix.create([1,2,3]);
let matPadded = mat.pad([2]);
let matUnpadded;
test.assertArrayEqual(matPadded.data, [0,0,1,2,3,0,0])
matUnpadded = matPadded.unpad([2]);
test.assertTrue(matUnpadded.equals(mat));
test.assertArrayEqual(mat.data, [1,2,3])

test.assertArrayEqual(mat.pad([2]).data, [0,0,1,2,3,0,0])
test.assertArrayEqual(mat.pad([2]).unpad([2]).data, [1,2,3])

test.groupStart('matrix-pad-2d');
mat = Matrix.create([[1,2,3], [4,5,6]]);
matPadded = mat.pad([1,2]);
test.assertArrayEqual(
    matPadded.data,
    [[0,0,0,0,0,0,0], [0,0,1,2,3,0,0], [0,0,4,5,6,0,0], [0,0,0,0,0,0,0]]
)
matUnpadded = matPadded.unpad([1,2]);
test.assertTrue(matUnpadded.equals(mat));
test.assertArrayEqual(mat.data, [[1,2,3], [4,5,6]])
test.assertArrayEqual(
    mat.pad([1,2]).data,
    [[0,0,0,0,0,0,0], [0,0,1,2,3,0,0], [0,0,4,5,6,0,0], [0,0,0,0,0,0,0]]
)

test.groupStart('matrix-pad-3d');
mat = Matrix.create([[[1,2], [3,4]], [[5,6], [7,8]]])
matPadded = mat.pad([1,1,1], type='zero', inplace=false);
test.assertArrayEqual(
    matPadded.data,
    [[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
     [[0,0,0,0], [0,1,2,0], [0,3,4,0], [0,0,0,0]],
     [[0,0,0,0], [0,5,6,0], [0,7,8,0], [0,0,0,0]],
     [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]]
)
matUnpadded = matPadded.unpad([1,1,1]);
test.assertTrue(matUnpadded.equals(mat))
test.assertArrayEqual(mat.data, [[[1,2], [3,4]], [[5,6], [7,8]]]);
test.assertArrayEqual(
    mat.pad([1,1,1]).data,
    [[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
     [[0,0,0,0], [0,1,2,0], [0,3,4,0], [0,0,0,0]],
     [[0,0,0,0], [0,5,6,0], [0,7,8,0], [0,0,0,0]],
     [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]]
)
test.assertArrayEqual(mat.data, [[[1,2], [3,4]], [[5,6], [7,8]]]);

test.groupStart('matrix-resize');
mat = Matrix.ones([1,1,1]);
let matResized = mat.resize([1,3,2], 'zero', false);
test.assertArrayEqual(matResized.data, [[[1,0], [0,0], [0,0]]]);

mat = Matrix.zeros([2,4]);
mat.resize([3,3], {fill: 'random', min: 1, max: 1}, true);
test.assertArrayEqual(mat.data, [[0,0,0],[0,0,0],[1,1,1]]);

test.groupStart('matrix-flatten');
test.assertArrayEqual(Matrix.ones([1]).flatten(), [1]);
test.assertArrayEqual(Matrix.ones([1, 2]).flatten(), [1, 1]);
test.assertArrayEqual(Matrix.ones([1,2,3]).flatten(), [1,1,1,1,1,1]);

test.groupStart('matrix-reshape');
mat = Matrix.ones([1,2,3]);
mat.reshape([3,1,2]);
test.assertArrayEqual(mat.data, [[[1,1]], [[1,1]], [[1,1]]]);
mat.reshape([2,3]);
test.assertArrayEqual(mat.data, [[1,1,1], [1,1,1]]);
mat = Matrix.ones([2,3]);
test.assertArrayEqual(mat.reshape([1, 3,2], false).data, [[[1,1], [1,1], [1,1]]]);
test.assertArrayEqual(mat.data, [[1,1,1], [1,1,1]])

test.groupStart('matrix.stringify');
mat = Matrix.create([1,2,3]);
test.assertEqual(mat.stringify(), "1 2 3");
mat = Matrix.create([[1,2], [2,3]]);
test.assertEqual(mat.stringify(), "1 2\n2 3");
mat = Matrix.create([[[1,2], [2,3]], [[3,4], [5,6]]]);
test.assertEqual(mat.stringify(), "1 2\n2 3\n---\n3 4\n5 6");

test.groupStart('matrix.mulsum');
mat = Matrix.create([1]);
let mat2 = Matrix.create([2]);
test.assertEqual(mat.mulsum(mat2), 2);
mat = Matrix.create([2,3]);
mat2 = Matrix.create([3,1]);
test.assertEqual(mat.mulsum(mat2), 9);
mat = Matrix.create([[1,2], [1,3]]);
mat2 = Matrix.create([[3,1], [2,3]]);
test.assertEqual(mat.mulsum(mat2), 16);
mat = Matrix.create([[[1,2], [1,3]], [[1,1], [2,2]]]);
mat2 = Matrix.create([[[3,1], [2,3]], [[0,1], [1,1]]]);
test.assertEqual(mat.mulsum(mat2), 21);

test.groupStart('matrix.min/max/mean');
test.assertEqual(mat.mean(), 13.0/8.0)
test.assertEqual(mat.min(), 1)
test.assertEqual(mat.max(), 3)
test.assertEqual(mat2.mean(), 12.0/8.0)
test.assertEqual(mat2.min(), 0)
test.assertEqual(mat2.max(), 3)
test.assertEqual(Matrix.create([1,2,3]).min(), 1)
test.assertEqual(Matrix.create([1,2,3]).max(), 3)
test.assertEqual(Matrix.create([[1,2],[3,4]]).min(), 1)
test.assertEqual(Matrix.create([[1,2],[3,4]]).max(), 4)

test.groupStart('matrix.copy');
mat = Matrix.create([1,2,3]);
mat2 = mat.copy();
mat.replace([1], [8]);
test.assertArrayEqual(mat.data, [1,8,3]);
test.assertArrayEqual(mat2.data, [1,2,3]);

test.groupStart('matrix.dilation');
mat = Matrix.create([1,1,1]);
test.assertArrayEqual(mat.dilate([2]).data, [1,0,1,0,1]);
mat = Matrix.create([[1,1,1], [1,1,1]]);
test.assertArrayEqual(mat.dilate([2,2]).data, [[1,0,1,0,1], [0,0,0,0,0], [1,0,1,0,1]]);
mat = Matrix.create([[[1,1], [1,1]], [[1,1], [1,1]]]);
test.assertArrayEqual(mat.dilate([2,2,2]).data, [[[1,0,1], [0,0,0], [1,0,1]], [[0,0,0], [0,0,0], [0,0,0]], [[1,0,1], [0,0,0], [1,0,1]]]);

test.groupStart('matrix.get/set');
mat = Matrix.create([1,2,3]);
test.assertEqual(mat.get([2]), 3);
mat.set([0], 3);
test.assertArrayEqual(mat.data, [3,2,3]);

mat = Matrix.create([[1,2], [1,3]]);
test.assertEqual(mat.get([1,0]), 1);
mat.set([1,1], 10);
test.assertArrayEqual(mat.data, [[1,2], [1,10]]);

mat = Matrix.create([[[1,2], [1,3]], [[1,1], [2,2]]]);
test.assertEqual(mat.get([0,1,1]), 3);
mat.set([1,0,1], 8);
test.assertArrayEqual(mat.data, [[[1,2], [1,3]], [[1,8], [2,2]]])

test.groupStart('matrix.forEach')
mat = Matrix.create([1,2,3]);
let foreachResult = [];
mat.forEach(d => foreachResult.push(d*2));
test.assertArrayEqual(foreachResult, [2,4,6]);
mat.forEach((d, i) => foreachResult[i] /= 2);
test.assertArrayEqual(foreachResult, [1,2,3]);

mat = Matrix.create([[1,2], [1,3]]);
foreachResult = [];
mat.forEach(d => foreachResult.push(d*2));
test.assertArrayEqual(foreachResult, [2,4,2,6]);
foreachResult = [];
mat.forEach((d, i, j) => foreachResult.push([d, i, j]));
test.assertArrayEqual(foreachResult, [[1, 0, 0], [2, 0, 1], [1, 1, 0], [3, 1, 1]]);

mat = Matrix.create([[[1,2], [1,3]], [[1,1], [2,2]]]);
foreachResult = [];
mat.forEach(d => foreachResult.push(d*2));
test.assertArrayEqual(foreachResult, [2,4,2,6,2,2,4,4]);
foreachResult = [];
mat.forEach((d, i, j, k) => foreachResult.push([d, i, j, k]));
test.assertArrayEqual(foreachResult, [
    [1, 0, 0, 0],
    [2, 0, 0, 1],
    [1, 0, 1, 0],
    [3, 0, 1, 1],
    [1, 1, 0, 0],
    [1, 1, 0, 1],
    [2, 1, 1, 0],
    [2, 1, 1, 1]]);

test.groupStart('matrix.map');
mat = Matrix.create([1,2,3]);
test.assertArrayEqual(mat.map(d => 2*d).data, [2,4,6]);
mat = Matrix.create([[1,2], [1,3]]);
test.assertArrayEqual(mat.map(d => 2*d).data, [[2,4], [2,6]]);
mat = Matrix.create([[[1,2], [1,3]], [[1,1], [2,2]]]);
test.assertArrayEqual(mat.map(d => 2*d).data, [[[2,4],[2,6]],[[2,2],[4,4]]]);

test.groupStart('convolution-1d')
mat = Matrix.create([1,2,3,2,1]);
let convoluted = mat.conv([0], [1,1], [1], [1]);
test.assertTrue(convoluted instanceof Convolution);
test.assertArrayEqual(convoluted.output.data, [3,5,5,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([0]), [0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1]), [1]);
test.assertArrayEqual(convoluted.inCoordsToOut([2]), [2]);
test.assertArrayEqual(convoluted.inCoordsToOut([3]), [3]);
test.assertArrayEqual(convoluted.inCoordsToOut([4]), [3]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], true), [[0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], true), [[1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], true), [[2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], true), [[3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], true), [[3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], false), [[0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], false), [[1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], false), [[2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], false), [[3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], false), [[3,4]]);
test.assertArrayEqual(convoluted.outCoordsToIn([0]), [0]);
test.assertArrayEqual(convoluted.outCoordsToIn([1]), [1]);
test.assertArrayEqual(convoluted.outCoordsToIn([2]), [2]);
test.assertArrayEqual(convoluted.outCoordsToIn([3]), [3]);

test.groupStart('convolution-1d-dilation')
mat = Matrix.create([1,2,3,2,1]);
convoluted = mat.conv([0], [1,1], [2], [1]);
test.assertArrayEqual(convoluted.output.data, [4,4,4]);
test.assertArrayEqual(convoluted.inCoordsToOut([0]), [0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1]), [1]);
test.assertArrayEqual(convoluted.inCoordsToOut([2]), [2]);
test.assertArrayEqual(convoluted.inCoordsToOut([3]), [2]);
test.assertArrayEqual(convoluted.inCoordsToOut([4]), [2]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], true), [[0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], true), [[1,2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], true), [[2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], true), [[2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], true), [[2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], false), [[0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], false), [[1,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], false), [[2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], false), [[2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], false), [[2,4]]);
test.assertArrayEqual(convoluted.outCoordsToIn([0]), [0]);
test.assertArrayEqual(convoluted.outCoordsToIn([1]), [1]);
test.assertArrayEqual(convoluted.outCoordsToIn([2]), [2]);
test.assertArrayEqual(convoluted.outCoordsToIn([3]), [3]);

test.groupStart('convolution-1d-stride')
mat = Matrix.create([1,2,3,2,1]);
convoluted = mat.conv([0], [1,1], [1], [2]);
test.assertArrayEqual(convoluted.output.data, [3,5]);
test.assertArrayEqual(convoluted.inCoordsToOut([0]), [0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1]), [0]);
test.assertArrayEqual(convoluted.inCoordsToOut([2]), [1], 'inCoordsToOut([2])'); //4
test.assertArrayEqual(convoluted.inCoordsToOut([3]), [1]);
test.assertArrayEqual(convoluted.inCoordsToOut([4]), [1]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], true), [[0,1]]); //7
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], true), [[0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], true), [[2,3]]); //9
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], true), [[2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], true), [[2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], false), [[0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], false), [[0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], false), [[2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], false), [[2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], false), [[2,3]]);
test.assertArrayEqual(convoluted.outCoordsToIn([0]), [0]);
test.assertArrayEqual(convoluted.outCoordsToIn([1]), [2]);

test.groupStart('convolution-1d-all')
mat = Matrix.create([1,2,3,2]);
convoluted = mat.conv([2], [1,1], [2], [2]);
// 0,0,1,2,3,2,0,0
// 1,0,1
//     1,0,1
//         1,0,1
test.assertArrayEqual(convoluted.output.data, [1,4,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([0]), [0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1]), [0]);
test.assertArrayEqual(convoluted.inCoordsToOut([2]), [1]); //4
test.assertArrayEqual(convoluted.inCoordsToOut([3]), [1]);
test.assertArrayEqual(convoluted.inCoordsToOut([4]), [2]);
test.assertArrayEqual(convoluted.inCoordsToOut([5]), [2]);
test.assertArrayEqual(convoluted.inCoordsToOut([6]), [2]);
test.assertArrayEqual(convoluted.inCoordsToOut([7]), [2]); // 9
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], true), [[0,1,2]]); //10
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], true), [[0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], true), [[2,3,4]]); //12
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], true), [[2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], true), [[4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5], true), [[4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6], true), [[4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7], true), [[4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0], false), [[0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1], false), [[0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2], false), [[2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3], false), [[2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4], false), [[4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5], false), [[4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6], false), [[4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7], false), [[4,6]]);
test.assertArrayEqual(convoluted.outCoordsToIn([0]), [0]);
test.assertArrayEqual(convoluted.outCoordsToIn([1]), [2]);
test.assertArrayEqual(convoluted.outCoordsToIn([2]), [4]);

test.groupStart('convolution-2d')
mat = Matrix.create([
    [1,2,3,2,1],
    [0,1,2,1,0],
    [0,2,1,1,1],
    [3,1,2,1,2],
]);
convoluted = mat.conv([0,0], [
    [0,1],
    [1,0]
], [1,1], [1,1]);
test.assertTrue(convoluted instanceof Convolution); //1
test.assertArrayEqual(convoluted.output.data, [ //2
    [2,4,4,2],
    [1,4,2,1],
    [5,2,3,2]
]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,0]), [0,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,1]), [0,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,2]), [0,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,3]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,4]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,0]), [1,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,1]), [1,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,2]), [1,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,3]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,4]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,0]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,1]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,2]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,3]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,4]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,0]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,1]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,2]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,3]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,4]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,0], true), [[0,1], [0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,1], true), [[0,1], [1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,2], true), [[0,1], [2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,3], true), [[0,1], [3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,4], true), [[0,1], [3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,0], false), [[0,1], [0,1]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,1], false), [[0,1], [1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,2], false), [[0,1], [2,3]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,3], false), [[0,1], [3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,4], false), [[0,1], [3,4]]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 0]), [0, 0]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 1]), [0, 1]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 2]), [0, 2]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 3]), [0, 3]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 0]), [1, 0]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 1]), [1, 1]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 2]), [1, 2]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 3]), [1, 3]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 0]), [2, 0]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 1]), [2, 1]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 2]), [2, 2]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 3]), [2, 3]);

test.groupStart('convolution-2d-all')
mat = Matrix.create([
    [1,2,3,2,1,1],
    [0,1,2,1,0,1],
    [0,2,1,1,1,1],
    [3,1,2,1,2,1],
]);
convoluted = mat.conv([2,2], [
    [0,1],
    [1,0]
], [2,2], [2,2]);
test.assertTrue(convoluted instanceof Convolution); //1
//
// 0,0,0,0,0,0,0,0,0,0
// 0,0,0,0,0,0,0,0,0,0
// 0,0,1,2,3,2,1,1,0,0      0,0,1
// 0,0,0,1,2,1,0,1,0,0  =>  0,0,0
// 0,0,0,2,1,1,1,1,0,0      1,0,0
// 0,0,3,1,2,1,2,1,0,0
// 0,0,0,0,0,0,0,0,0,0
// 0,0,0,0,0,0,0,0,0,0
//
test.assertArrayEqual(convoluted.output.data, [ //2
    [0,1,3,1],
    [1,3,2,1],
    [0,1,1,0]
]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,0]), [0,0]);//3
test.assertArrayEqual(convoluted.inCoordsToOut([0,1]), [0,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,2]), [0,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,3]), [0,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,4]), [0,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,5]), [0,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,6]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,7]), [0,3]);//10
test.assertArrayEqual(convoluted.inCoordsToOut([0,8]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([0,9]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,0]), [0,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,1]), [0,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,2]), [0,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,3]), [0,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,4]), [0,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,5]), [0,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,6]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,7]), [0,3]);//20
test.assertArrayEqual(convoluted.inCoordsToOut([1,8]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([1,9]), [0,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,0]), [1,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,1]), [1,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,2]), [1,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,3]), [1,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,4]), [1,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,5]), [1,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,6]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,7]), [1,3]);//30
test.assertArrayEqual(convoluted.inCoordsToOut([2,8]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([2,9]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,0]), [1,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,1]), [1,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,2]), [1,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,3]), [1,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,4]), [1,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,5]), [1,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,6]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,7]), [1,3]);//40
test.assertArrayEqual(convoluted.inCoordsToOut([3,8]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([3,9]), [1,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,0]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,1]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,2]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,3]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,4]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,5]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,6]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,7]), [2,3]);//50
test.assertArrayEqual(convoluted.inCoordsToOut([4,8]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([4,9]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,0]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,1]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,2]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,3]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,4]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,5]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,6]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,7]), [2,3]);//60
test.assertArrayEqual(convoluted.inCoordsToOut([5,8]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([5,9]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,0]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,1]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,2]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,3]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,4]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,5]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,6]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,7]), [2,3]);//70
test.assertArrayEqual(convoluted.inCoordsToOut([6,8]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([6,9]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,0]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,1]), [2,0]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,2]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,3]), [2,1]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,4]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,5]), [2,2]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,6]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,7]), [2,3]);//80
test.assertArrayEqual(convoluted.inCoordsToOut([7,8]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToOut([7,9]), [2,3]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,0], true), [[0,1,2], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,1], true), [[0,1,2], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,2], true), [[0,1,2], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,3], true), [[0,1,2], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,4], true), [[0,1,2], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,5], true), [[0,1,2], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,6], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,7], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,8], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,9], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,0], true), [[0,1,2], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,1], true), [[0,1,2], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,2], true), [[0,1,2], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,3], true), [[0,1,2], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,4], true), [[0,1,2], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,5], true), [[0,1,2], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,6], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,7], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,8], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,9], true), [[0,1,2], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,0], true), [[2,3,4], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,1], true), [[2,3,4], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,2], true), [[2,3,4], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,3], true), [[2,3,4], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,4], true), [[2,3,4], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,5], true), [[2,3,4], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,6], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,7], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,8], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,9], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,0], true), [[2,3,4], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,1], true), [[2,3,4], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,2], true), [[2,3,4], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,3], true), [[2,3,4], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,4], true), [[2,3,4], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,5], true), [[2,3,4], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,6], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,7], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,8], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,9], true), [[2,3,4], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,0], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,1], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,2], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,3], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,4], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,5], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,6], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,7], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,8], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,9], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,0], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,1], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,2], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,3], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,4], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,5], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,6], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,7], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,8], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,9], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,0], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,1], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,2], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,3], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,4], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,5], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,6], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,7], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,8], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,9], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,0], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,1], true), [[4,5,6], [0,1,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,2], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,3], true), [[4,5,6], [2,3,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,4], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,5], true), [[4,5,6], [4,5,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,6], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,7], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,8], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,9], true), [[4,5,6], [6,7,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,0], false), [[0,2], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,1], false), [[0,2], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,2], false), [[0,2], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,3], false), [[0,2], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,4], false), [[0,2], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,5], false), [[0,2], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,6], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,7], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,8], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([0,9], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,0], false), [[0,2], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,1], false), [[0,2], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,2], false), [[0,2], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,3], false), [[0,2], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,4], false), [[0,2], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,5], false), [[0,2], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,6], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,7], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,8], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([1,9], false), [[0,2], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,0], false), [[2,4], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,1], false), [[2,4], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,2], false), [[2,4], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,3], false), [[2,4], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,4], false), [[2,4], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,5], false), [[2,4], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,6], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,7], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,8], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([2,9], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,0], false), [[2,4], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,1], false), [[2,4], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,2], false), [[2,4], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,3], false), [[2,4], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,4], false), [[2,4], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,5], false), [[2,4], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,6], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,7], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,8], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([3,9], false), [[2,4], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,0], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,1], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,2], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,3], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,4], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,5], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,6], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,7], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,8], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([4,9], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,0], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,1], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,2], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,3], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,4], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,5], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,6], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,7], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,8], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([5,9], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,0], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,1], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,2], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,3], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,4], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,5], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,6], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,7], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,8], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([6,9], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,0], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,1], false), [[4,6], [0,2]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,2], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,3], false), [[4,6], [2,4]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,4], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,5], false), [[4,6], [4,6]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,6], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,7], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,8], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.inCoordsToBlockIndexes([7,9], false), [[4,6], [6,8]]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 0]), [0, 0]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 1]), [0, 2]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 2]), [0, 4]);
test.assertArrayEqual(convoluted.outCoordsToIn([0, 3]), [0, 6]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 0]), [2, 0]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 1]), [2, 2]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 2]), [2, 4]);
test.assertArrayEqual(convoluted.outCoordsToIn([1, 3]), [2, 6]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 0]), [4, 0]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 1]), [4, 2]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 2]), [4, 4]);
test.assertArrayEqual(convoluted.outCoordsToIn([2, 3]), [4, 6]);

test.done();
*/
