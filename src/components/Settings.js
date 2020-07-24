import React, { useState } from 'react';
import Card from './Card';
import SettingsInputDimensionality from './settings/SettingsInputDimensionality';
import SettingsInputDimension from './settings/SettingsInputDimension';
import SettingsKernel from './settings/SettingsKernel';

function Settings(props) {

    return <Card title="Settings">
        <form>
            <div className="form-group">
                <label className="mb-1">Input dimensionality</label>
                <SettingsInputDimensionality
                    dimty={props.settings.dimty}
                    dimtyChange={props.dimtyChange} />
                <label className="mt-2 mb-1">Input dimension</label>
                <SettingsInputDimension
                    dimty={props.settings.dimty}
                    values={props.settings.input}
                    inDimChange={props.inDimChange} />
                <label className="mt-2 mb-0">Kernel</label>
                <SettingsKernel
                    dimty={props.settings.dimty}
                    kernel={props.settings.kernel}
                    kernelChange={props.kernelChange} />
            </div>
        </form>
    </Card>;
}

export default Settings;
