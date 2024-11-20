import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type GuestsModalProps = {
    open: boolean;
    toggleDialog: () => void;
};

const GuestsModal: React.FC<GuestsModalProps> = ({ open, toggleDialog }) => {
    return (
        <Dialog onOpenChange={(stat) => toggleDialog()} open={open}>
            <DialogContent className='min-h-[200px] min-w-[60vw]'>
                <DialogHeader className='flex justify-between items-start'>
                    <DialogTitle>Guests Modal</DialogTitle>
                    <div className=' w-full flex'>
                        <Button variant={'ghost'} className='mr-auto' onClick={toggleDialog}>Close</Button>
                        <Button variant={'ghost'} className='mr-2' onClick={toggleDialog}>Iptal Masa Durumu</Button>
                        <Button variant={'ghost'} className='mr-2' onClick={toggleDialog}>NoShow Masa Durumu</Button>
                    </div>
                </DialogHeader>

            </DialogContent>
        </Dialog>
    );
};

export default GuestsModal;