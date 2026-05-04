import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateJobSeeking, useUpdateUser, useUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

export function ProfileTab() {
	const { user, setAuth, accessToken } = useAuthStore();
	const { data: fullUser, isLoading } = useUser(user?._id ?? "");
	const update = useUpdateUser();
	const updateJobSeeking = useUpdateJobSeeking();

	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [age, setAge] = useState<number | "">("");
	const [gender, setGender] = useState("");
	const [jobSeeking, setJobSeeking] = useState(false);

	useEffect(() => {
		if (fullUser) {
			setName(fullUser.name);
			setAddress(fullUser.address);
			setAge(fullUser.age);
			setGender(fullUser.gender);
			setJobSeeking(fullUser.isJobSeeking ?? false);
		}
	}, [fullUser]);

	if (isLoading || !fullUser) {
		return <Skeleton className="h-64 rounded-lg" />;
	}

	const handleSave = async () => {
		if (!user || !accessToken) return;
		await update.mutateAsync({
			id: user._id,
			data: { name, address, age: Number(age), gender },
		});
		setAuth({ ...user, name }, accessToken);
	};

	return (
		<div className="space-y-4">
			<div className="space-y-1.5">
				<Label htmlFor="profile-email">Email</Label>
				<Input
					id="profile-email"
					value={fullUser.email}
					disabled
					className="bg-muted"
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="profile-name">Họ và tên</Label>
				<Input
					id="profile-name"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
					}}
				/>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label htmlFor="profile-age">Tuổi</Label>
					<Input
						id="profile-age"
						type="number"
						value={age}
						onChange={(e) => {
							setAge(e.target.value ? Number(e.target.value) : "");
						}}
					/>
				</div>
				<div className="space-y-1.5">
					<Label>Giới tính</Label>
					<Select value={gender} onValueChange={setGender}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Chọn..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="MALE">Nam</SelectItem>
							<SelectItem value="FEMALE">Nữ</SelectItem>
							<SelectItem value="OTHER">Khác</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="profile-address">Địa chỉ</Label>
				<Input
					id="profile-address"
					value={address}
					onChange={(e) => {
						setAddress(e.target.value);
					}}
				/>
			</div>
			<Button
				onClick={handleSave}
				disabled={update.isPending}
				className="cursor-pointer bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
			>
				{update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
			</Button>

			{/* Job Seeking toggle */}
			<div className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-4">
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
						<Search className="h-4 w-4 text-primary" />
					</div>
					<div className="min-w-0">
						<p className="font-heading text-sm font-semibold text-foreground">
							Đang tìm việc
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Bật để nhà tuyển dụng có thể tìm thấy hồ sơ của bạn.
						</p>
					</div>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={jobSeeking}
					disabled={updateJobSeeking.isPending}
					onClick={() => {
						const next = !jobSeeking;
						setJobSeeking(next);
						updateJobSeeking.mutate(next, {
							onError: () => {
								setJobSeeking(!next);
							},
						});
					}}
					className={cn(
						"relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
						jobSeeking ? "bg-[#22C55E]" : "bg-muted",
						updateJobSeeking.isPending && "opacity-60",
					)}
				>
					<span
						className={cn(
							"inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
							jobSeeking ? "translate-x-5" : "translate-x-0.5",
						)}
					/>
				</button>
			</div>
		</div>
	);
}
