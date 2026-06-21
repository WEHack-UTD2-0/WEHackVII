"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
    toggleRegistrationEnabled,
    toggleRegistrationMessageEnabled,
    toggleSecretRegistrationEnabled,
    toggleRSVPs,
    setRSVPLimit,
} from "@/actions/admin/registration-actions";
import { UpdateItemWithConfirmation } from "./UpdateItemWithConfirmation";

interface RegistrationTogglesProps {
    defaultRegistrationEnabled: boolean;
    defaultSecretRegistrationEnabled: boolean;
    defaultRSVPsEnabled: boolean;
    defaultRSVPLimit: number;
}

// Standard MLH & Custom Registration Questions Schema
const registrationQuestions = [
    { id: "skills", label: "What is your current experience level with programming?", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
    { id: "tracks", label: "Which hackathon track or category interests you the most?", type: "text" },
    { id: "dietary", label: "Do you have any dietary restrictions or food allergies?", type: "text" },
    { id: "conduct", label: "Do you agree to abide by the official MLH Code of Conduct?", type: "checkbox" }
];

export function RegistrationToggles({
    defaultSecretRegistrationEnabled,
    defaultRegistrationEnabled,
    defaultRSVPsEnabled,
    defaultRSVPLimit,
}: RegistrationTogglesProps) {
    const [showQuestionsPreview, setShowQuestionsPreview] = useState(false);

    const {
        execute: executeToggleSecretRegistrationEnabled,
        optimisticState: ToggleSecretRegistrationEnabledOptimisticData,
    } = useOptimisticAction(toggleSecretRegistrationEnabled, {
        currentState: {
            success: true,
            statusSet: defaultSecretRegistrationEnabled,
        },
        updateFn: (state, { enabled }) => {
            return { statusSet: enabled, success: true };
        },
    });

    const {
        execute: executeToggleRSVPs,
        optimisticState: toggleRSVPsOptimisticData,
    } = useOptimisticAction(toggleRSVPs, {
        currentState: { success: true, statusSet: defaultRSVPsEnabled },
        updateFn: (state, { enabled }) => {
            return { statusSet: enabled, success: true };
        },
    });

    const {
        execute: executeToggleRegistrationEnabled,
        optimisticState: ToggleRegistrationEnabledOptimisticData,
    } = useOptimisticAction(toggleRegistrationEnabled, {
        currentState: { success: true, statusSet: defaultRegistrationEnabled },
        updateFn: (state, { enabled }) => {
            return { statusSet: enabled, success: true };
        },
    });

    const {
        execute: executeSetRSVPLimit,
        optimisticState: SetRSVPLimitOptimisticData,
    } = useOptimisticAction(setRSVPLimit, {
        currentState: { success: true, statusSet: defaultRSVPLimit },
        updateFn: (state, { rsvpLimit }) => {
            return { statusSet: rsvpLimit, success: true };
        },
    });

    return (
        <>
            <div className="rounded-lg border-2 border-muted px-5 py-10">
                <h2 className="pb-5 text-3xl font-semibold">Registration</h2>
                <div className="max-w-[500px]">
                    <div className="flex items-center border-y border-y-muted py-4">
                        <p className="text-sm font-bold">New Registrations</p>
                        <Switch
                            className="ml-auto"
                            checked={
                                ToggleRegistrationEnabledOptimisticData.statusSet
                            }
                            onCheckedChange={(checked) => {
                                toast.success(
                                    `Registration ${checked ? "enabled" : "disabled"} successfully!`,
                                );
                                executeToggleRegistrationEnabled({
                                    enabled: checked,
                                });
                            }}
                        />
                    </div>
                    <div className="flex items-center border-b border-b-muted py-4">
                        <p className="text-sm font-bold">
                            Allow Secret Code Sign-up
                        </p>
                        <Switch
                            className="ml-auto"
                            checked={
                                ToggleSecretRegistrationEnabledOptimisticData.statusSet
                            }
                            onCheckedChange={(checked) => {
                                toast.success(
                                    `Secret registration ${checked ? "enabled" : "disabled"} successfully!`,
                                );
                                executeToggleSecretRegistrationEnabled({
                                    enabled: checked,
                                });
                            }}
                        />
                    </div>
                    
                    {/* BUTTON TO TRIGGER PREVIEW */}
                    <div className="pt-5">
                        <Button
                            type="button"
                            onClick={() => setShowQuestionsPreview(true)}
                            className="w-full bg-[#A6CDC4] text-[#282738] hover:bg-[#6e8d85]"
                        >
                            Preview Registration Questions
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="mt-5 rounded-lg border-2 border-muted px-5 py-10">
                <h2 className="pb-5 text-3xl font-semibold">RSVPs</h2>
                <div className="max-w-[500px]">
                    <div className="flex items-center border-t border-t-muted py-4">
                        <p className="text-sm font-bold">Allow RSVPs</p>
                        <Switch
                            className="ml-auto"
                            checked={toggleRSVPsOptimisticData.statusSet}
                            onCheckedChange={(checked) => {
                                toast.success(
                                    `RSVPs ${checked ? "enabled" : "disabled"} successfully!`,
                                );
                                executeToggleRSVPs({ enabled: checked });
                            }}
                        />
                    </div>
                    <div className="flex items-center border-b border-t border-t-muted py-4">
                        <p className="mr-auto text-sm font-bold">RSVP Limit</p>
                        <UpdateItemWithConfirmation
                            defaultValue={SetRSVPLimitOptimisticData.statusSet}
                            enabled={toggleRSVPsOptimisticData.statusSet}
                            type="number"
                            onSubmit={(newLimit) => {
                                toast.success(
                                    `Hacker RSVP limit successfully changed to ${newLimit}!`,
                                );
                                executeSetRSVPLimit({ rsvpLimit: newLimit });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL OVERLAY */}
            {showQuestionsPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-background p-6 shadow-xl border-2 border-muted text-card-foreground bg-popover">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-[#D09C51]">Registration Form Preview</h3>
                            <Button 
                                variant="ghost"
                                onClick={() => setShowQuestionsPreview(false)}
                                className="text-sm font-bold"
                            >
                                ✕ Close
                            </Button>
                        </div>
                        
                        <form className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 text-left" onSubmit={(e) => e.preventDefault()}>
                            {registrationQuestions.map((q) => (
                                <div key={q.id} className="flex flex-col gap-1.5">
                                    <Label className="text-sm font-semibold">{q.label}</Label>
                                    {q.type === "select" ? (
                                        <select className="w-full rounded-md border border-input bg-background p-2 text-sm">
                                            {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    ) : q.type === "checkbox" ? (
                                        <div className="flex items-start gap-3 pt-1">
                                            <input type="checkbox" id={q.id} className="mt-1 h-4 w-4 rounded border-input text-hackathon" disabled />
                                            <span className="text-xs text-muted-foreground">Applicants must check this to complete profiles.</span>
                                        </div>
                                    ) : (
                                        <Input type="text" placeholder="Sample response placeholder..." disabled />
                                    )}
                                </div>
                            ))}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}