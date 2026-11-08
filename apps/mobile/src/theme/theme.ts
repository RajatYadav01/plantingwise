export const theme = {
	colors: {
		forest: "#234A36",
		forestDeep: "#173927",
		leaf: "#507A55",
		sage: "#DDE8D8",
		sageLight: "#EEF3E9",
		canvas: "#F7F8F3",
		white: "#FFFFFF",
		ink: "#202B23",
		muted: "#718075",
		line: "#E4E9E1",
		amber: "#D79B48",
		amberSoft: "#FFF2D9",
		red: "#B94A42",
		redSoft: "#FCEBE8",
		blueSoft: "#E9F2F6",
		shadow: "#153320",
	},
	radius: { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 },
	spacing: { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 40 },
};

export const typography = {
	title: { fontSize: 30, lineHeight: 36, fontWeight: "700" as const, letterSpacing: -0.7 },
	heading: { fontSize: 21, lineHeight: 27, fontWeight: "700" as const, letterSpacing: -0.25 },
	body: { fontSize: 15, lineHeight: 22 },
	small: { fontSize: 12, lineHeight: 17 },
};
