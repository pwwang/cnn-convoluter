import React, { useState } from 'react';
import Settings from './Settings'
import Kernel from './Kernel'
import Show from './Show'

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
    const [settings, setSettings] = useState(defaultSettings[1]);

    function dimtyChange(event) {
        event.stopPropagation();
        event.preventDefault();
        let dimty = parseInt(event.target.dataset.dimty);
        setSettings(defaultSettings[dimty]);
    }

    function inDimChange(event) {
        let index = parseInt(event.target.name.replace("dim", ""))
        let settingsCopy = {...settings}
        settingsCopy.input[index - 1] = parseInt(event.target.value)
        setSettings(settingsCopy);
    }

    function kernelChange(what, event) {
        let index = parseInt(event.target.name.replace("dim", ""))
        let settingsCopy = {...settings}
        settingsCopy.kernel[what][index - 1] = parseInt(event.target.value)
        setSettings(settingsCopy);
    }

    return (
        <div className="container-fluid mt-3 ml-2 mr-2 h-9x">
            <div className="row h-100 d-flex flex-row">
                <div className="mw-settings 0 pl-1 pr-0 h-100">
                    <Settings settings={settings}
                        dimtyChange={dimtyChange}
                        inDimChange={inDimChange}
                        kernelChange={kernelChange} />
                </div>
                <div className="flex-grow-9x pl-1 d-flex flex-column h-100">
                    <div className={`h-${settings.dimty}d`}>
                        <Kernel kernelSize={settings.kernel.size} />
                    </div>
                    <div className={`flex-grow-1 h-${settings.dimty}d-rest`}>
                        <Show {...settings} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
