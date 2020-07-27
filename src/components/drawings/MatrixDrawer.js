import React from 'react'

function Box({irow, icol, type, active, onMouseEnter}) {

    return <div className={"box box-" + type + (active ? " box-active" : "")}
        data-irow={irow}
        data-icol={icol}
        onMouseEnter={onMouseEnter}
    />
}

function MatrixDrawer({dims, padding, type, actives, onMouseEnter, onMouseLeave}) {

    actives = actives || [[], [], []];
    if (actives.length === 0) {
        actives = [[], [], []];
    }
    padding = padding || [0, 0, 0];

    const nrows = dims[1] + padding[1] * 2;
    const ncols = dims[2] + padding[2] * 2;

    return <>
        {
            [...Array(nrows).keys()].map(irow => {

                return <div key={`box-row-${irow}`} className="box-row"
                    onMouseLeave={onMouseLeave}>
                    { [...Array(ncols).keys()].map(icol => {
                        let typeClass = type;
                        if (type === 'input' && (
                            irow < padding[1] || irow >= nrows - padding[1] ||
                            icol < padding[2] || icol >= ncols - padding[2]
                        )) {
                            typeClass = type + ' box-padding'
                        }
                        if (type === 'kernel' || ncols > 50 || nrows > 50) {
                            typeClass += ' box-small'
                        }

                        return <Box key={`box-${irow}-${icol}`}
                            irow={irow}
                            icol={icol}
                            active={actives[1].includes(irow) && actives[2].includes(icol)}
                            onMouseEnter={onMouseEnter}
                            type={typeClass} />
                    }) }
               </div>
            })
        }
    </>
}

export default MatrixDrawer;
