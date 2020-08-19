import { Matrix } from './math.js';

export const copySettings = (orig) => {
    const ret = {};
    for (let key in orig) {
        const val = orig[key];
        if (val instanceof Matrix) {
            ret[key] = val.copy();
        } else if (val.constructor === Object) {
            ret[key] = copySettings(val);
        } else {
            ret[key] = JSON.parse(JSON.stringify(val));
        }
    }
    return ret;
};

export const defaultSettings = {
    autoWalker: true,
    visual: true,
    showData: false,
    dimty: 2, // defaults to 2d.
    dims: {
        1: {
            input: {
                data: Matrix.random([10]),
                size: [10],
                padding: [0]
            },
            kernel: {
                type: 'conv',
                data: Matrix.random([3], -1, 1),
                size: [3],
                dilation: [1],
                stride: [1]
            }
        },
        2: {
            input: {
                data: Matrix.random([9, 9]),
                size: [9, 9],
                padding: [0, 0]
            },
            kernel: {
                type: 'conv',
                data: Matrix.random([3, 3], -1, 1),
                size: [3, 3],
                dilation: [1, 1],
                stride: [1, 1]
            }
        },
        3: {
            input: {
                data: Matrix.random([5, 5, 5]),
                size: [5, 5, 5],
                padding: [0, 0, 0]
            },
            kernel: {
                type: 'conv',
                data: Matrix.random([2, 2, 2], -1, 1),
                size: [2, 2, 2],
                dilation: [1, 1, 1],
                stride: [1, 1, 1]
            }
        }
    }
};
