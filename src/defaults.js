const settings = {
    autoWalker: true,
    visual: true,
    dimty: 2,
    dims: {
        1: {
            input: [10],
            kernel: {
                type: 'conv',
                size: [3],
                stride: [1],
                padding: [0],
                dilation: [1]
            }
        },
        2: {
            input: [9, 9],
            kernel: {
                type: 'conv',
                size: [3, 3],
                stride: [1, 1],
                padding: [0, 0],
                dilation: [1, 1]
            }
        },
        3: {
            input: [5, 5, 5],
            kernel: {
                type: 'conv',
                size: [2, 2, 2],
                stride: [1, 1, 1],
                padding: [0, 0, 0],
                dilation: [1, 1, 1]
            }
        },
    }
};

export default settings;
