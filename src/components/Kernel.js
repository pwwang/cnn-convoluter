import React, { Suspense, useRef, useState, useEffect } from 'react';
import Card from './Card';
import MatrixDrawer from './drawings/MatrixDrawer'

function Kernel({ kernelSize }) {

    return <Card title="Kernel">
        <div className="h-9x">
            <MatrixDrawer dims={kernelSize} padding={null} type="kernel" />
        </div>
    </Card>;
}

export default Kernel;
