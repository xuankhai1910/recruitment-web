import { useEffect, useState } from "react";

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
		</div>
	);
}
