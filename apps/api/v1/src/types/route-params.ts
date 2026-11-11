/**
 * Parameters used by API routes with a single named `:id` segment.
 *
 * Express 5's default ParamsDictionary can include string[] for wildcard
 * parameters. These routes use ordinary `:id` segments, so model them as
 * strings to keep database UUID comparisons correctly typed.
 */
export type IdRouteParams = {
	id: string;
};
