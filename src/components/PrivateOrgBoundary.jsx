import { isDemoMode } from '../demo/demoMode.js';
import React from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../utils/api.js';
import Settings from '../pages/Settings.jsx';

function PrivateOverview({orgId}) {
  const [org,setOrg]=React.useState(null),[error,setError]=React.useState('');
  React.useEffect(()=>{api(`/api/orgs/${encodeURIComponent(orgId)}/organization`).then(r=>setOrg(r.organization)).catch(e=>setError(e.message));},[orgId]);
  const modules=[['needs','Needs'],['pledges','Pledges'],['inventory','Inventory'],['people','People'],['meetings','Meetings'],['events','Events'],['drive','Drive and private forms'],['witness','Witness archive'],['chat-module','Native chat']];
  return <main style={{maxWidth:1000,margin:'0 auto',padding:24}}><h1>{org?.name||'Private organization'}</h1>
    <p>Member-only encrypted content. Your device unlocks records; the server stores ciphertext.</p>
    {error&&<p role="alert">{error} <Link to="settings?tab=security">Open Security</Link></p>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>{modules.map(([path,label])=><Link className="card" style={{padding:20}} key={path} to={`/org/${encodeURIComponent(orgId)}/${path}`}>{label}</Link>)}</div>
    <p><Link to="settings?tab=security">Encryption, recovery, and emergency controls</Link> · <Link to="settings?tab=members">Members</Link> · <Link to="settings?tab=invites">Invite a member</Link></p>
    <p>Public publishing and external integrations are unavailable here. Accounts, membership roles, record identifiers, timestamps, traffic, and ciphertext sizes remain visible to the server.</p>
  </main>;
}
export default function PrivateOrgBoundary({children}) {
  const {orgId}=useParams(),location=useLocation();
  const [state,setState]=React.useState(null),[error,setError]=React.useState('');
  React.useEffect(()=>{
    if(isDemoMode()){setState({state:"off",orgId});return;}
    let live=true;
    const refresh=()=>api(`/api/orgs/${encodeURIComponent(orgId)}/privacy`).then(s=>{if(live){setState({...s,orgId});setError('');}}).catch(e=>{if(live)setError(e.message);});
    refresh();window.addEventListener('bf-private-mode-changed',refresh);
    return()=>{live=false;window.removeEventListener('bf-private-mode-changed',refresh);};
  },[orgId]);
  if(error)return <p role="alert">Cannot verify organization privacy settings: {error}</p>;
  if(!state||state.orgId!==orgId)return <p>Checking organization privacy…</p>;
  if(state.state==='off')return children;
  const prefix=`/org/${encodeURIComponent(orgId)}`, tail=location.pathname.slice(prefix.length).replace(/^\//,'');
  if(tail==='settings') {
    const tab=new URLSearchParams(location.search).get('tab');
    if(!['security','members','invites','pledges'].includes(tab))return <Navigate to={prefix+'/settings?tab=security'} replace/>;
    return <Settings privateMode/>;
  }
  if(state.state==='migrating')return <Navigate to={prefix+'/settings?tab=security'} replace/>;
  if(!tail||tail==='overview')return <PrivateOverview orgId={orgId}/>;
  if(tail==='chat')return <Navigate to={prefix+'/chat-module'} replace/>;
  if(tail==='intake')return <Navigate to={prefix+'/drive'} replace/>;
  if(tail==='pledges')return <Navigate to={prefix+'/settings?tab=pledges'} replace/>;
  if(/^(needs|inventory|people|meetings|events|drive|witness|chat-module)(\/|$)/.test(tail))return children;
  return <main style={{padding:24}}><h2>Unavailable in member-only mode</h2><p>This feature has not been connected to member-only encrypted storage. It cannot send or process readable organization content here.</p><Link to={prefix}>Return to private organization</Link></main>;
}
