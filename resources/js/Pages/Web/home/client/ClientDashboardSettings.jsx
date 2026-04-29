import React from 'react';
import Header from "./ClientHeader";
import Settings from '../../components/client/Settings';
import { usePage } from '@inertiajs/react';

const ClientDashboardSettings = () => {
  const { auth } = usePage().props;
  
  return (
    <div>
     <Header />
     <Settings user={auth?.user} />
    </div>
  )
}

export default ClientDashboardSettings;