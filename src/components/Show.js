import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import MatrixDrawer from './drawings/MatrixDrawer';

const expandChunk = (start, size, dilation=1) => {
    const ret = [];
    let i = 0;
    while (i < size) {
        ret.push(i + start);
        i += dilation;
    }
    return ret;
}

function Show({ dimty, input, kernel, autoWalker, visual }) {

    const [inActives, setInActives] = useState([])
    const [outActives, setOutActives] = useState([])

    const deps = [dimty, JSON.stringify(input), JSON.stringify(kernel)];

    const realKernelSizes = useMemo(() => [0, 1, 2].map(
        i => kernel.dilation[i] * (kernel.size[i] - 1) + 1
    ), deps)

    function walkChunks(idim) {
        const totalLen = input[idim] + 2* kernel.padding[idim];
        // let's break this into chunks
        const ret = [];
        let cur = 1;
        while (cur <= totalLen - realKernelSizes[idim] + 1) {
            // make it 0-based for searching
            ret.push(cur - 1);
            cur += kernel.stride[idim]
        }
        return ret;
    }

    function findChunk(chunks, i) {
        // i should be 0-based
        // return the right-most chunk
        for (let index = chunks.length - 1; index >= 0; index--) {
            if (i >= chunks[index]) {
                return index
            }
        }
        return null;
    }

    const [chunks0, chunks1, chunks2] = useMemo(() => {
        return [walkChunks(0), walkChunks(1), walkChunks(2)];
    }, deps);


    // need some calculations for output dimensions
    const outDim = [chunks0.length, chunks1.length, chunks2.length];

    useEffect(() => {
        if (!autoWalker) {
            onMouseLeave(undefined);
            return undefined;
        }
        let walkRow = 0;
        let walkCol = 0;
        const interval = setInterval(() => {
            const orow = walkRow % chunks1.length;
            const ocol = walkCol % chunks2.length;
            hoverInput(chunks1[orow], chunks2[ocol]);
            if (ocol === chunks2.length - 1) {
                walkRow ++;
            }
            walkCol ++;
        }, 400);

        return () => clearInterval(interval);
    }, [JSON.stringify(deps), autoWalker]);

    function hoverInput(irow, icol) {
        const outRow = findChunk(chunks1, irow);
        const outCol = findChunk(chunks2, icol);

        hoverOutput(outRow, outCol);
    }

    function hoverOutput(orow, ocol) {

        setInActives([[],
                      expandChunk(chunks1[orow], realKernelSizes[1], kernel.dilation[1]),
                      expandChunk(chunks2[ocol], realKernelSizes[2], kernel.dilation[2])]);
        setOutActives([[], [orow], [ocol]]);
    }

    function inputOnMouseEnter(event) {
        const irow = parseInt(event.target.dataset.irow);
        const icol = parseInt(event.target.dataset.icol);

        hoverInput(irow, icol);
    }

    function onMouseLeave(event) {
        setInActives([[], [], []]);
        setOutActives([[], [], []]);
    }

    function outputOnMouseEnter(event) {
        let orow = parseInt(event.target.dataset.irow);
        let ocol = parseInt(event.target.dataset.icol);

        hoverOutput(orow, ocol);
    }

    return <Card>
        <div className="row h-100 overflow-auto">
            <div className="col-6 h-100 d-flex flex-column">
                <h5 className="card-title">Input</h5>
                <div className="flex-grow-1 h-any overflow-x-auto">
                    {visual ? <MatrixDrawer dims={input}
                        padding={kernel.padding}
                        type="input"
                        actives={inActives}
                        onMouseEnter={inputOnMouseEnter}
                        onMouseLeave={onMouseLeave}
                    /> : <div className="alert alert-dark" role="alert">
                        Visualization disabled.
                    </div>}
                </div>
            </div>
            <div className="col-6 pl-0 h-100 d-flex flex-column">
                <h5 className="card-title">
                    Output: {JSON.stringify(outDim.slice(outDim.length - dimty)).replace(/,/g, ' x ')}
                </h5>
                <div className="flex-grow-1 h-any overflow-x-auto">
                    {visual ? <MatrixDrawer dims={outDim} padding={null}
                        type="output"
                        actives={outActives}
                        onMouseEnter={outputOnMouseEnter}
                        onMouseLeave={onMouseLeave}
                    /> : <div className="alert alert-dark" role="alert">
                        Visualization disabled.
                    </div>}
                </div>
            </div>
        </div>
    </Card>;
}

export default Show;
