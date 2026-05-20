import { Component, type ReactNode } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State {
	error: Error | null;
}

interface Props {
	children: ReactNode;
	/** Reset boundary state when this key changes (e.g. on route navigation). */
	resetKey?: string;
}

/**
 * Account-scoped error boundary. Without this, a render-time throw in any
 * account tab unmounts the entire app (including the header), which we hit
 * twice when populated refs came back as null. Keep the layout intact and
 * show a recoverable error card in the main content slot instead.
 */
export class AccountErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidUpdate(prevProps: Props) {
		if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
			this.setState({ error: null });
		}
	}

	componentDidCatch(error: Error, info: unknown) {
		console.error("[AccountErrorBoundary]", error, info);
	}

	private handleReload = () => {
		this.setState({ error: null });
	};

	render() {
		if (!this.state.error) return this.props.children;

		return (
			<div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-200/70 bg-rose-50/40 py-12 px-6 text-center">
				<div className="grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-600">
					<AlertCircle className="h-7 w-7" />
				</div>
				<div className="space-y-1">
					<p className="font-heading text-base font-semibold text-slate-900">
						Đã xảy ra lỗi khi hiển thị trang
					</p>
					<p className="max-w-md text-sm text-slate-500">
						Một thành phần trên trang đã gặp lỗi. Bạn có thể thử tải lại
						hoặc chuyển sang mục khác trong menu bên trái.
					</p>
					<p className="mt-2 max-w-md text-xs text-slate-400">
						{this.state.error.message}
					</p>
				</div>
				<Button
					onClick={this.handleReload}
					className="mt-1 cursor-pointer bg-blue-500 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-600"
				>
					<RotateCw className="mr-2 h-4 w-4" />
					Thử lại
				</Button>
			</div>
		);
	}
}
