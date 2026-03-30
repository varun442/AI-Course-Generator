import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

const LoadingDialog = ({loading}) => {
  return (
    <div>
      <AlertDialog open={loading}>
        <AlertDialogContent>
          <AlertDialogTitle/>
          <AlertDialogHeader>
            <AlertDialogDescription asChild>
                <span className="flex flex-col items-center py-10">
                    <Image alt="placeholder"  src="/loading.gif" width={100} height={100} />
                    <span className="text-lg font-medium mt-3">Please wait... AI is working on your request</span>
                </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoadingDialog;
