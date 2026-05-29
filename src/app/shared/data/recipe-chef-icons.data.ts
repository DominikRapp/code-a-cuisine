export interface RecipeChefIcon {
    src: string;
    alt: string;
}

const RECIPE_CHEF_ICON_NAMES = ['one', 'two', 'three', 'four'] as const;

export const RECIPE_CHEF_ICONS: RecipeChefIcon[] = RECIPE_CHEF_ICON_NAMES.map((name, index) => ({
    src: `assets/images/svg/chef-${name}.svg`,
    alt: `Chef ${index + 1}`,
}));

/** Returns the chef icons for the selected cooking person count. */
export function getRecipeChefIcons(count: number): RecipeChefIcon[] {
    return RECIPE_CHEF_ICONS.slice(0, count);
}

/** Returns the chef icon for one recipe step. */
export function getRecipeChefIconByStep(
    stepIndex: number,
    chefIcons: readonly RecipeChefIcon[],
): RecipeChefIcon {
    return chefIcons[stepIndex % chefIcons.length] ?? RECIPE_CHEF_ICONS[0];
}