import React, { useState } from 'react';
import Settings from './Settings'
import Kernel from './Kernel'
import Show from './Show'

function padDimension(dim, dimty, padNumber) {
    if (dim.length === dimty)
        return dim;

    const toPad = Array(dimty - dim.length).fill(padNumber);
    return [...toPad, ...dim];
}

function App() {
    let defaultSettings = {
        1: {
            dimty: 1,
            input: [10],
            kernel: {
                size: [3],
                stride: [1],
                padding: [0],
                dilation: [1]
            }
        },
        2: {
            dimty: 2,
            input: [9, 9],
            kernel: {
                size: [3, 3],
                stride: [1, 1],
                padding: [0, 0],
                dilation: [1, 1]
            }
        },
        3: {
            dimty: 3,
            input: [6, 6, 6],
            kernel: {
                size: [3, 3, 3],
                stride: [1, 1, 1],
                padding: [0, 0, 0],
                dilation: [1, 1, 1]
            }
        },
    }
    const [settings, setSettings] = useState(padSettings(defaultSettings[1]));
    const [autoWalker, setAutoWalker] = useState(true);
    const [visual, setVisual] = useState(true);

    function padSettings(sets) {
        const ret = {...sets};
        ret.input = padDimension(ret.input, 3, 1);
        ret.kernel.size = padDimension(ret.kernel.size, 3, 1);
        ret.kernel.stride = padDimension(ret.kernel.stride, 3, 1);
        ret.kernel.padding = padDimension(ret.kernel.padding, 3, 0);
        ret.kernel.dilation = padDimension(ret.kernel.dilation, 3, 1);
        return ret;
    }

    function dimtyChange(event) {
        event.stopPropagation();
        event.preventDefault();
        let dimty = parseInt(event.target.dataset.dimty);
        setSettings(padSettings(defaultSettings[dimty]));
    }

    function fallback(value, defaultValue) {
        // try to make input a valid number
        // if not, fallback to default if value isn't a number
        value = value.replace(/[^\d]+/g, '');
        return (value.length > 0 && !isNaN(value)) ? parseInt(value) : defaultValue;
    }

    function inDimChange(event) {
        let index = parseInt(event.target.name.replace("dim", ""))
        let settingsCopy = {...settings}
        settingsCopy.input[index] = fallback(event.target.value, settings[index]);
        setSettings(settingsCopy);
    }

    function kernelChange(what, event) {
        let index = parseInt(event.target.name.replace("dim", ""))
        let settingsCopy = {...settings}
        settingsCopy.kernel[what][index] = fallback(event.target.value, settings.kernel[what][index]);
        setSettings(settingsCopy);
    }

    function autoWalkerClick(event) {
        setAutoWalker(!autoWalker);
    }

    function visualClick(event) {
        if (settings.dimty == 3) {
            return;
        }
        setVisual(!visual);
    }

    return (
        <div className="container-fluid mt-3 ml-2 mr-2 h-9x">
            <div className="row h-100 d-flex flex-row">
                <div className="mw-settings 0 pl-1 pr-0 h-100">
                    <Settings settings={settings}
                        dimtyChange={dimtyChange}
                        inDimChange={inDimChange}
                        kernelChange={kernelChange}
                        autoWalker={autoWalker}
                        autoWalkerClick={autoWalkerClick}
                        visual={visual}
                        visualClick={visualClick}
                        />
                </div>
                <div className="flex-grow-9x w-any pl-1 d-flex flex-column h-100">
                    <div>
                        <Kernel kernelSize={settings.kernel.size} />
                    </div>
                    <div className="flex-grow-1 h-any">
                        <Show {...settings} visual={visual} autoWalker={autoWalker} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
