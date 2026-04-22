import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { useUploadFile } from "@/hooks/useFiles";
import {
	useDeleteRecommendationCv,
	useRecommendationCv,
	useSetRecommendationCv,
} from "@/hooks/useCvRecommendation";
import type { Resume } from "@/types/resume";

import { AnalyzingState } from "../cv-recommendation/AnalyzingState";
import {
	DeleteCvDialog,
	ReplaceCvDialog,
} from "../cv-recommendation/ConfirmDialogs";
import { CvDetails } from "../cv-recommendation/CvDetails";
import { EmptyState } from "../cv-recommendation/EmptyState";
import { SelectResumeView } from "../cv-recommendation/SelectResumeView";
import { UploadCvView } from "../cv-recommendation/UploadCvView";

type Mode = "view" | "upload" | "select-resume";

interface RecommendationCvTabProps {
	onClose?: () => void;
}

export function RecommendationCvTab({ onClose }: RecommendationCvTabProps) {
	const navigate = useNavigate();
	const { data, isLoading } = useRecommendationCv();
	const setCv = useSetRecommendationCv();
	const removeCv = useDeleteRecommendationCv();
	const uploadFile = useUploadFile();

	const [mode, setMode] = useState<Mode>("view");
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [confirmReplace, setConfirmReplace] = useState(false);

	const cv = data?.recommendationCv ?? null;
	const analysis = data?.analysis ?? null;
	const isAnalyzing = uploadFile.isPending || setCv.isPending;

	useEffect(() => {
		if (cv) setMode("view");
	}, [cv]);

	const handleUpload = async (file: File) => {
		const { fileName } = await uploadFile.mutateAsync({
			file,
			folderType: "resume",
		});
		await setCv.mutateAsync({ url: fileName, source: "upload" });
	};

	const handleSelectResume = async (resume: Resume) => {
		if (!resume.url.toLowerCase().endsWith(".pdf")) {
			toast.error("Chỉ hỗ trợ CV định dạng PDF");
			return;
		}
		await setCv.mutateAsync({ url: resume.url, source: "resume" });
	};

	const handleDelete = async () => {
		await removeCv.mutateAsync();
		setConfirmDelete(false);
	};

	const handleViewRecommendations = () => {
		onClose?.();
		navigate("/jobs/recommended");
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-24 rounded-xl" />
				<Skeleton className="h-40 rounded-xl" />
			</div>
		);
	}

	if (isAnalyzing) return <AnalyzingState />;

	if (mode === "upload") {
		return (
			<UploadCvView
				onBack={() => {
					setMode("view");
				}}
				onSubmit={handleUpload}
			/>
		);
	}

	if (mode === "select-resume") {
		return (
			<SelectResumeView
				onBack={() => {
					setMode("view");
				}}
				onSelect={handleSelectResume}
			/>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{!cv || !analysis ? (
					<EmptyState
						onUpload={() => {
							setMode("upload");
						}}
						onSelect={() => {
							setMode("select-resume");
						}}
					/>
				) : (
					<CvDetails
						cv={cv}
						analysis={analysis}
						onReplace={() => {
							setConfirmReplace(true);
						}}
						onDelete={() => {
							setConfirmDelete(true);
						}}
						onView={handleViewRecommendations}
					/>
				)}
			</div>

			<ReplaceCvDialog
				open={confirmReplace}
				onOpenChange={setConfirmReplace}
				onUploadNew={() => {
					setConfirmReplace(false);
					setMode("upload");
				}}
				onPickResume={() => {
					setConfirmReplace(false);
					setMode("select-resume");
				}}
			/>

			<DeleteCvDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				onConfirm={handleDelete}
				isDeleting={removeCv.isPending}
			/>
		</>
	);
}
