import { Button, Flex, Popover, Text, TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";

type ColumnFilterPopoverProps = {
	label: string;
	value?: string;
	placeholder?: string;
	onChange: (value?: string) => void;
};

export function ColumnFilterPopover({
	label,
	value,
	placeholder,
	onChange,
}: ColumnFilterPopoverProps) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value ?? "");

	useEffect(() => {
		if (!open) {
			setDraft(value ?? "");
		}
	}, [open, value]);

	const apply = () => {
		const nextValue = draft.trim();
		onChange(nextValue || undefined);
		setOpen(false);
	};

	const clear = () => {
		onChange(undefined);
		setDraft("");
		setOpen(false);
	};

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger>
				<Button type="button" variant="ghost" size="1">
					Filter
				</Button>
			</Popover.Trigger>
			<Popover.Content size="1">
				<Flex direction="column" gap="3" width="220px">
					<Text size="2" weight="medium">
						{label} contains
					</Text>
					<TextField.Root
						value={draft}
						placeholder={placeholder ?? `Filter ${label}`}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								apply();
							}
						}}
					/>
					<Flex gap="2" justify="end">
						<Button type="button" variant="soft" size="1" onClick={clear}>
							Clear
						</Button>
						<Button type="button" size="1" onClick={apply}>
							Apply
						</Button>
					</Flex>
				</Flex>
			</Popover.Content>
		</Popover.Root>
	);
}
