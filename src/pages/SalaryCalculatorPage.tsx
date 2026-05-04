import { useState } from "react";
import {
	Calculator,
	Coins,
	HeartPulse,
	Landmark,
	ShieldCheck,
	Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalculateSalary } from "@/hooks/useTools";
import type {
	SalaryBreakdown,
	SalaryCalculatorRequest,
	SalaryMode,
} from "@/api/tools.api";
import { formatSalary } from "@/lib/constants";

const REGIONS = [
	{ value: "1", label: "Vùng I" },
	{ value: "2", label: "Vùng II" },
	{ value: "3", label: "Vùng III" },
	{ value: "4", label: "Vùng IV" },
];

export function SalaryCalculatorPage() {
	const [mode, setMode] = useState<SalaryMode>("GROSS_TO_NET");
	const [amount, setAmount] = useState<string>("20000000");
	const [region, setRegion] = useState<"1" | "2" | "3" | "4">("1");
	const [dependents, setDependents] = useState<string>("0");
	const [insuranceBase, setInsuranceBase] = useState<string>("");
	const calc = useCalculateSalary();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const payload: SalaryCalculatorRequest = {
			mode,
			amount: Number(amount) || 0,
			region: Number(region) as 1 | 2 | 3 | 4,
			dependents: Number(dependents) || 0,
			insuranceBase: insuranceBase ? Number(insuranceBase) : undefined,
		};
		calc.mutate(payload);
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
					<Calculator className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
						Tính lương Gross / Net
					</h1>
					<p className="text-sm text-muted-foreground">
						Tính nhanh lương thực nhận theo quy định mới nhất
					</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
				<Card>
					<CardContent className="p-5 sm:p-6">
						<Tabs
							value={mode}
							onValueChange={(v) => {
								setMode(v as SalaryMode);
							}}
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="GROSS_TO_NET">Gross → Net</TabsTrigger>
								<TabsTrigger value="NET_TO_GROSS">Net → Gross</TabsTrigger>
							</TabsList>
						</Tabs>

						<form onSubmit={handleSubmit} className="mt-5 space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="amount">
									{mode === "GROSS_TO_NET"
										? "Lương Gross (VND)"
										: "Lương Net (VND)"}
								</Label>
								<Input
									id="amount"
									type="number"
									min={0}
									value={amount}
									onChange={(e) => {
										setAmount(e.target.value);
									}}
									placeholder="VD: 20000000"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Vùng</Label>
									<Select
										value={region}
										onValueChange={(v) => {
											setRegion(v as "1" | "2" | "3" | "4");
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{REGIONS.map((r) => (
												<SelectItem key={r.value} value={r.value}>
													{r.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="dependents">Số người phụ thuộc</Label>
									<Input
										id="dependents"
										type="number"
										min={0}
										value={dependents}
										onChange={(e) => {
											setDependents(e.target.value);
										}}
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="insuranceBase">Lương đóng BH (tùy chọn)</Label>
								<Input
									id="insuranceBase"
									type="number"
									min={0}
									value={insuranceBase}
									onChange={(e) => {
										setInsuranceBase(e.target.value);
									}}
									placeholder="Để trống để dùng lương Gross"
								/>
							</div>

							<Button
								type="submit"
								disabled={calc.isPending}
								className="w-full cursor-pointer bg-[#22C55E] text-white hover:bg-[#16A34A]"
								size="lg"
							>
								{calc.isPending ? "Đang tính..." : "Tính ngay"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-5 sm:p-6">
						<h2 className="font-heading text-base font-semibold text-foreground">
							Kết quả
						</h2>
						{calc.isPending ? (
							<div className="mt-4 space-y-3">
								<Skeleton className="h-16 rounded-lg" />
								<Skeleton className="h-40 rounded-lg" />
							</div>
						) : calc.data ? (
							<SalaryResult data={calc.data} />
						) : (
							<p className="mt-6 text-sm text-muted-foreground">
								Nhập thông tin và bấm "Tính ngay" để xem kết quả chi tiết.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function SalaryResult({ data }: { data: SalaryBreakdown }) {
	const items = [
		{
			label: "Gross",
			value: data.gross,
			color: "#0369A1",
			icon: Wallet,
		},
		{
			label: "BHXH (8%)",
			value: data.socialInsurance,
			color: "#F59E0B",
			icon: ShieldCheck,
		},
		{
			label: "BHYT (1.5%)",
			value: data.healthInsurance,
			color: "#EF4444",
			icon: HeartPulse,
		},
		{
			label: "BHTN (1%)",
			value: data.unemploymentInsurance,
			color: "#8B5CF6",
			icon: ShieldCheck,
		},
		{
			label: "Thuế TNCN",
			value: data.incomeTax,
			color: "#0EA5E9",
			icon: Landmark,
		},
		{
			label: "Net",
			value: data.net,
			color: "#22C55E",
			icon: Coins,
		},
	];

	const max = Math.max(...items.map((i) => i.value), 1);

	return (
		<div className="mt-4 space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<div className="rounded-lg border border-border bg-muted/30 p-3">
					<p className="text-xs text-muted-foreground">Tổng Gross</p>
					<p className="mt-0.5 font-heading text-lg font-bold text-foreground">
						{formatSalary(data.gross)}
					</p>
				</div>
				<div className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 p-3">
					<p className="text-xs text-[#16A34A]">Thực nhận (Net)</p>
					<p className="mt-0.5 font-heading text-lg font-bold text-[#16A34A]">
						{formatSalary(data.net)}
					</p>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-muted/20 p-4">
				<h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Phân tích chi tiết
				</h3>
				<div className="space-y-2.5">
					{items.map((it) => {
						const pct = (it.value / max) * 100;
						const Icon = it.icon;
						return (
							<div key={it.label}>
								<div className="flex items-center justify-between text-xs">
									<span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
										<Icon className="h-3.5 w-3.5" style={{ color: it.color }} />
										{it.label}
									</span>
									<span className="font-heading font-semibold text-foreground">
										{formatSalary(it.value)}
									</span>
								</div>
								<div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full rounded-full transition-all"
										style={{
											width: `${pct}%`,
											backgroundColor: it.color,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
				<p>
					Lương đóng BH:{" "}
					<span className="font-medium text-foreground">
						{formatSalary(data.insuranceBase)}
					</span>
				</p>
				<p className="mt-1">
					Thu nhập tính thuế:{" "}
					<span className="font-medium text-foreground">
						{formatSalary(data.taxableIncome)}
					</span>
				</p>
				<p className="mt-1">
					Giảm trừ bản thân: {formatSalary(data.personalDeduction)} · Giảm trừ
					phụ thuộc: {formatSalary(data.dependentDeduction)}
				</p>
			</div>
		</div>
	);
}
