import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from 'react-three-fiber'

// useEffect(..., [])?
const dummy = new THREE.Object3D();
const material = new THREE.MeshBasicMaterial({ color: 0x810181 });

function Matrix({ dims }) {

    const ref = useRef()
    const dimty = dims.length;

    let geometry = useMemo(
        () => new THREE.BoxBufferGeometry(.9, .9, dims.length < 3 ? .1 : .9),
        [dims.length]
    );

    function init() {
        let i = 0;
        if (dimty === 1) {
            let harf = Math.floor(dims[0] / 2);
            for (let x = 0; x < dims[0]; x++) {
                dummy.position.set( harf - x, harf, harf );
                dummy.updateMatrix();
                ref.current.setMatrixAt(i++, dummy.matrix);
            }
        } else if (dimty === 2) {
            let harf1 = Math.floor(dims[0] / 2);
            let harf2 = Math.floor(dims[1] / 2);
            for (let x = 0; x < dims[0]; x++) {
                for (let y = 0; y < dims[1]; y++) {
                    dummy.position.set( harf1 - x, harf2 - y, harf1 );
                    dummy.updateMatrix();
                    ref.current.setMatrixAt(i++, dummy.matrix);
                }
            }
        } else { // dimty === 3
            let harf1 = Math.floor(dims[0] / 2);
            let harf2 = Math.floor(dims[1] / 2);
            let harf3 = Math.floor(dims[2] / 2);
            for (let x = 0; x < dims[0]; x++) {
                for (let y = 0; y < dims[1]; y++) {
                    for (let z = 0; z < dims[2]; z++) {
                        dummy.position.set( harf1 - x, harf2 - y, harf3 - z );
                        dummy.updateMatrix();
                        ref.current.setMatrixAt(i++, dummy.matrix);
                    }
                }
            }
        }

        ref.current.instanceMatrix.needsUpdate = true
        //return () => ref.current.geometry.dispose();
    }

    useEffect(init, [JSON.stringify(dims)])

    return (
        <instancedMesh ref={ref}
            args={[geometry, material, dims.reduce((a, b) => a * b, 1)]}>
        </instancedMesh>
    )
}

export default Matrix
