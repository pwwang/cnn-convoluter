import React, { useState } from 'react';
import Card from './Card';
import SettingsInputDimensionality from './settings/SettingsInputDimensionality';
import SettingsInputDimension from './settings/SettingsInputDimension';
import SettingsKernel from './settings/SettingsKernel';
import SettingsAutoWalker from './settings/SettingsAutoWalker';
import SettingsVisualization from './settings/SettingsVisualization';

function Settings({settings, dimtyChange, inDimChange, kernelChange,
                   autoWalker, autoWalkerClick, visual, visualClick}) {

    return <Card title="Settings">
        <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
                <label className="mb-1">Visualization</label>
                <SettingsVisualization status={visual} onClick={visualClick} />
                <label className="mb-1">Input dimensionality</label>
                <SettingsInputDimensionality
                    dimty={settings.dimty}
                    visual={visual}
                    dimtyChange={dimtyChange} />
                <label className="mt-2 mb-1">Input dimension</label>
                <SettingsInputDimension
                    dimty={settings.dimty}
                    values={settings.input}
                    inDimChange={inDimChange} />
                <label className="mt-2 mb-0">Kernel</label>
                <SettingsKernel
                    dimty={settings.dimty}
                    kernel={settings.kernel}
                    kernelChange={kernelChange} />
                {visual ? <>
                    <label className="mt-2 clearfix">AutoWalker</label>
                    <SettingsAutoWalker status={autoWalker} onClick={autoWalkerClick} />
                </> : null}
            </div>
        </form>
    </Card>;
}

export default Settings;
