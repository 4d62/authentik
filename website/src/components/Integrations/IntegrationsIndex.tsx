import React, { useMemo } from "react";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import type {
    PropSidebar,
    PropSidebarItem,
    PropSidebarItemLink,
    PropSidebarItemCategory,
} from "@docusaurus/plugin-content-docs";
import clsx from "clsx";
import DocCard from "@theme/DocCard";

const IGNORED_URLS = new Set(["/integrations/", "/integrations/services/"]);
const CARD_CLASSES = "col col--4 margin-bottom--lg";

interface CategoryGroup {
    category: string;
    items: PropSidebarItemLink[];
}

/**
 * Type guard to determine if a sidebar item is a category
 */
const isCategory = (item: PropSidebarItem): item is PropSidebarItemCategory => {
    return item.type === "category";
};

/**
 * Type guard to determine if a sidebar item is a link
 */
const isLink = (item: PropSidebarItem): item is PropSidebarItemLink => {
    return item.type === "link";
};

/**
 * Custom hook to fetch and process all integration items from the sidebar
 * Groups items by their parent category
 */
function useGroupedIntegrations(): CategoryGroup[] {
    const sidebar = useDocsSidebar();

    return useMemo(() => {
        if (!sidebar) {
            console.warn("No sidebar found for integrations");
            return [];
        }

        /**
         * Recursively processes sidebar items to maintain category structure
         */
        const processItems = (
            items: PropSidebarItem[],
            parentCategory?: string,
        ): CategoryGroup[] => {
            const groups: CategoryGroup[] = [];
            const uncategorizedItems: PropSidebarItemLink[] = [];

            items.forEach((item) => {
                if (isCategory(item)) {
                    // Process category items
                    const categoryGroups = processItems(item.items, item.label);
                    groups.push(...categoryGroups);
                } else if (isLink(item) && !IGNORED_URLS.has(item.href)) {
                    // Collect links
                    if (parentCategory) {
                        const existingGroup = groups.find(
                            (g) => g.category === parentCategory,
                        );
                        if (existingGroup) {
                            existingGroup.items.push(item);
                        } else {
                            groups.push({
                                category: parentCategory,
                                items: [item],
                            });
                        }
                    } else {
                        uncategorizedItems.push(item);
                    }
                }
            });

            // Add uncategorized items if any exist
            if (uncategorizedItems.length > 0) {
                groups.push({ category: "Other", items: uncategorizedItems });
            }

            return groups;
        };

        const sidebarItems = Array.isArray(sidebar.items) ? sidebar.items : [];
        return processItems(sidebarItems);
    }, [sidebar]);
}

/**
 * Component to render a category section
 */
function CategorySection({ category, items }: CategoryGroup) {
    return (
        <div className="margin-bottom--xl">
            <h2 className="margin-bottom--lg">{category}</h2>
            <div className="row">
                {items.map((item) => (
                    <article key={item.href} className={CARD_CLASSES} itemScope>
                        <DocCard item={item} />
                    </article>
                ))}
            </div>
        </div>
    );
}

/**
 * Main component that renders the categorized integrations index page
 */
function IntegrationsIndex() {
    const groupedIntegrations = useGroupedIntegrations();

    return (
        <section className="padding-horiz--md">
            {groupedIntegrations.length > 0 ? (
                groupedIntegrations.map((group) => (
                    <CategorySection
                        key={group.category}
                        category={group.category}
                        items={group.items}
                    />
                ))
            ) : (
                <div className="col text--center padding-vert--xl">
                    <p>No integrations found.</p>
                </div>
            )}
        </section>
    );
}

export default IntegrationsIndex;
