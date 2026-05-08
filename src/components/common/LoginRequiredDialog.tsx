import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface LoginRequiredDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Message shown below the title. Defaults to a generic login prompt. */
	description?: string;
}

export function LoginRequiredDialog({
	open,
	onOpenChange,
	description = "Bạn cần đăng nhập để thực hiện hành động này.",
}: LoginRequiredDialogProps) {
	const navigate = useNavigate();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Yêu cầu đăng nhập</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<Button
						variant="outline"
						className="w-full cursor-pointer sm:w-auto"
						onClick={() => {
							onOpenChange(false);
							navigate("/register");
						}}
					>
						<UserPlus className="mr-2 h-4 w-4" />
						Đăng ký
					</Button>
					<Button
						className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
						onClick={() => {
							onOpenChange(false);
							navigate("/login");
						}}
					>
						<LogIn className="mr-2 h-4 w-4" />
						Đăng nhập
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
