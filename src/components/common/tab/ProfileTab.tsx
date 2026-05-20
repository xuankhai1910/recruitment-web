import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
import { useUpdateUser, useUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";

export function ProfileTab() {
	const { user, setAuth, accessToken } = useAuthStore();
	const { data: fullUser, isLoading } = useUser(user?._id ?? "");
	const update = useUpdateUser();

	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [age, setAge] = useState<number | "">("");
	const [gender, setGender] = useState("");

	useEffect(() => {
		if (fullUser) {
			setName(fullUser.name);
			setAddress(fullUser.address);
			setAge(fullUser.age);
			setGender(fullUser.gender);
		}
	}, [fullUser]);

	if (isLoading || !fullUser) {
		return <Skeleton className="h-72 rounded-lg" />;
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
				<Label htmlFor="profile-email" className="text-xs text-slate-600">
					Email
				</Label>
				<Input
					id="profile-email"
					value={fullUser.email}
					disabled
					className="h-10 bg-slate-50 text-slate-700"
				/>
				<p className="text-xs text-slate-400">Email không thể thay đổi</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-1.5 sm:col-span-2">
					<Label htmlFor="profile-name" className="text-xs text-slate-600">
						Họ và tên
					</Label>
					<Input
						id="profile-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="h-10"
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="profile-age" className="text-xs text-slate-600">
						Tuổi
					</Label>
					<Input
						id="profile-age"
						type="number"
						value={age}
						onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
						className="h-10"
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-xs text-slate-600">Giới tính</Label>
					<Select value={gender} onValueChange={setGender}>
						<SelectTrigger className="h-10 w-full cursor-pointer">
							<SelectValue placeholder="Chọn..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="MALE" className="cursor-pointer">
								Nam
							</SelectItem>
							<SelectItem value="FEMALE" className="cursor-pointer">
								Nữ
							</SelectItem>
							<SelectItem value="OTHER" className="cursor-pointer">
								Khác
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5 sm:col-span-2">
					<Label htmlFor="profile-address" className="text-xs text-slate-600">
						Địa chỉ
					</Label>
					<Input
						id="profile-address"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						className="h-10"
					/>
				</div>
			</div>

			<div className="flex justify-end pt-2">
				<Button
					onClick={handleSave}
					disabled={update.isPending}
					className="cursor-pointer bg-blue-500 px-5 text-white shadow-sm shadow-blue-500/20 transition-colors duration-150 hover:bg-blue-600"
				>
					{update.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					{update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
				</Button>
			</div>
		</div>
	);
}
