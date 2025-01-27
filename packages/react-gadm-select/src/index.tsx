import React from 'react';
import {useState} from "react";
import { GADMDialog } from './components/GADMDialog';
import {BrowserRouter, Router } from 'react-router';
import { Button } from '@mui/material';

export const Index = ()=> {
    const [showDialog, setShowDialog] = useState<boolean>(true); // FIXME

    return (
        <>
            <BrowserRouter>
                <Button variant="contained" onClick={() => setShowDialog(true)} disabled={showDialog}>Open Dialog</Button>
                {showDialog && <GADMDialog setShowDialog={setShowDialog} initialize/>}
            </BrowserRouter>
        </>
    );
};
