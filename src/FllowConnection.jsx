import { SUPPORT_CONNECTION_LIST_MAP } from './constant'
import React from 'react';

const FlowConnection = ({ form, to, index }) => (
  <div className="flow-container" style={{ display: 'flex', alignItems: 'center', }}>
    <div className="icon" style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img src={form.icon} alt={form.type} style={{ width: '50%' }} />
    </div>

    <svg className="flow-line" width="100" height="4">
      <line
        x1="0"
        y1="2"
        x2="100"
        y2="2"
        stroke="#ccc"
        strokeDasharray="6,6"
        strokeWidth="2"
      />
      <circle r="4" fill="#4A90E2">
        <animateMotion dur="2s" repeatCount="indefinite" rotate="auto" begin={`${index * 0.4}s`}>
          <mpath xlinkHref={`#motionPath${index}`} />
        </animateMotion>
      </circle>
      <path id={`motionPath${index}`} d="M0,2 L300,2" fill="none" />
    </svg>

    <div className="icon" style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img src={to.icon} alt={to.type} style={{ width: '50%' }} />
    </div>

    <div style={{ marginLeft: 10, whiteSpace: 'nowrap', fontSize: 14, color: '#aaa' }}>
      {form.type} &gt; {to.type}
    </div>
  </div>
);

const ConnectionList = ({ connectionList = SUPPORT_CONNECTION_LIST_MAP }) => (
  <div>
    {connectionList?.map((item, index) => (
      <FlowConnection key={index} {...item} index={index} />
    ))}
    <div style={{ marginLeft: 10, marginBottom: 10, color: '#aaa' }}>......</div>
  </div>
);

export default ConnectionList;
