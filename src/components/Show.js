import React, { useRef, useEffect } from 'react';
import { Canvas } from 'react-three-fiber'
import { OrbitControls } from 'drei'
import Card from './Card';
import Matrix from './drawings/Matrix'

function Show({ dimty, input, kernel }) {

    // need some calculations for output dimensions
    const controlInput = useRef()
    const controlOutput = useRef()
    const controlInputProps = dimty === 3 ? {
        ref: controlInput,
        enablePan: true,
        enableZoom: true,
        enableRotate: true
    } : {
        ref: controlInput,
        enablePan: true,
        enableZoom: true,
        enableRotate: false
    }

    const controlOutputProps = {...controlInputProps}
    controlOutputProps.ref = controlOutput



    // only when dimensionality changed
    useEffect( () => {
            controlInput.current && controlInput.current.reset();
            controlOutput.current && controlOutput.current.reset();
        },
        [dimty] );

    return <Card>
        <div className="row h-100">
            <div className="col-6 h-100">
                <h5 className="card-title">Input</h5>
                <div className={`h-${dimty}d-rest`}>
                    <Canvas colorManagement invalidateFrameloop concurrent>
                    {/* <Suspense fallback={null}> */}
                        <Matrix dims={input} />
                        <OrbitControls {...controlInputProps} />
                    {/* </Suspense> */}
                    </Canvas>
                </div>
            </div>
            <div className="col-6 pl-0 h-100">
                <h5 className="card-title">Output</h5>
                <div className={`h-${dimty}d-rest`}>
                    <Canvas colorManagement invalidateFrameloop concurrent>
                    {/* <Suspense fallback={null}> */}
                        <Matrix dims={input} />
                        <OrbitControls {...controlOutputProps} />
                    {/* </Suspense> */}
                    </Canvas>
                </div>
            </div>
        </div>
    </Card>;
}

export default Show;
