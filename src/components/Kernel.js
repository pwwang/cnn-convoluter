import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from 'react-three-fiber'
import { OrbitControls } from 'drei'
import Card from './Card';
import Matrix from './drawings/Matrix'

function Kernel({ kernelSize }) {
    const control = useRef()
    const controlProps = kernelSize.length === 3 ? {
        ref: control,
        enablePan: true,
        enableZoom: true,
        enableRotate: true
    } : {
        ref: control,
        enablePan: true,
        enableZoom: true,
        enableRotate: false
    }

    // only when dimensionality changed
    useEffect( () => control.current && control.current.reset && control.current.reset(),
        [kernelSize.length] );

    return <Card title="Kernel">
        <div className="h-9x">
            <Canvas colorManagement invalidateFrameloop concurrent>
                {/* <Suspense fallback={null}> */}
                    <Matrix dims={kernelSize} />
                    <OrbitControls {...controlProps} />
                {/* </Suspense> */}
            </Canvas>
        </div>
    </Card>;
}

export default Kernel;
