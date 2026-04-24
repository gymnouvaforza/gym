import type { Cart, CartLineItem, PickupRequestDetail, PickupRequestLineItem } from "@/lib/cart/types";

function mapCartItemToPickupLineItem(item: CartLineItem): PickupRequestLineItem {
  return {
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    thumbnail: item.thumbnail,
    productId: item.productId,
    productTitle: item.productTitle,
    productHandle: item.productHandle,
    variantId: item.variantId,
    variantTitle: item.variantTitle,
    variantSku: item.variantSku,
    unitPrice: item.unitPrice,
    total: item.total,
    selectedOptions: item.selectedOptions,
  };
}

export function pickupSnapshotLooksBroken(pickupRequest: PickupRequestDetail) {
  if (pickupRequest.total > 0 && pickupRequest.subtotal > 0) {
    return pickupRequest.lineItems.some(
      (lineItem) => lineItem.quantity > 0 && lineItem.unitPrice <= 0 && lineItem.total <= 0,
    );
  }

  return pickupRequest.lineItems.some((lineItem) => lineItem.quantity > 0);
}

export function hydratePickupRequestFromCart(
  pickupRequest: PickupRequestDetail,
  cart: Cart,
): PickupRequestDetail {
  const mergedLineItems =
    pickupRequest.lineItems.length > 0
      ? pickupRequest.lineItems.map((lineItem) => {
          const matchingCartItem =
            cart.items.find((item) => lineItem.variantId && item.variantId === lineItem.variantId) ??
            cart.items.find((item) => lineItem.productId && item.productId === lineItem.productId) ??
            cart.items.find((item) => item.id === lineItem.id);

          if (!matchingCartItem) {
            return lineItem;
          }

          return {
            ...lineItem,
            quantity: lineItem.quantity > 0 ? lineItem.quantity : matchingCartItem.quantity,
            thumbnail: lineItem.thumbnail ?? matchingCartItem.thumbnail,
            productTitle: lineItem.productTitle ?? matchingCartItem.productTitle,
            productHandle: lineItem.productHandle ?? matchingCartItem.productHandle,
            variantTitle: lineItem.variantTitle ?? matchingCartItem.variantTitle,
            variantSku: lineItem.variantSku ?? matchingCartItem.variantSku,
            unitPrice: lineItem.unitPrice > 0 ? lineItem.unitPrice : matchingCartItem.unitPrice,
            total: lineItem.total > 0 ? lineItem.total : matchingCartItem.total,
            selectedOptions:
              lineItem.selectedOptions.length > 0
                ? lineItem.selectedOptions
                : matchingCartItem.selectedOptions,
          };
        })
      : cart.items.map((item) => mapCartItemToPickupLineItem(item));

  return {
    ...pickupRequest,
    currencyCode: cart.summary.currencyCode,
    itemCount: pickupRequest.itemCount > 0 ? pickupRequest.itemCount : cart.summary.itemCount,
    subtotal: pickupRequest.subtotal > 0 ? pickupRequest.subtotal : cart.summary.subtotal,
    total: pickupRequest.total > 0 ? pickupRequest.total : cart.summary.total,
    lineItems: mergedLineItems,
  };
}

interface RepairPickupRequestSnapshotOptions {
  retrieveCart?: (cartId: string) => Promise<Cart>;
  retrieveOrderByCartId?: (cartId: string) => Promise<{ id?: string | null } | null>;
  syncPickupRequestFromOrder?: (
    cartId: string,
    orderId: string,
  ) => Promise<PickupRequestDetail | null>;
}

export async function repairPickupRequestSnapshot(
  pickupRequest: PickupRequestDetail,
  options: RepairPickupRequestSnapshotOptions,
) {
  let currentPickupRequest = pickupRequest;
  let resolvedOrderId = pickupRequest.orderId;
  let recoveredFromLiveCart = false;

  if (!pickupSnapshotLooksBroken(currentPickupRequest)) {
    return {
      pickupRequest: currentPickupRequest,
      resolvedOrderId,
      recoveredFromLiveCart,
    };
  }

  if (!resolvedOrderId && currentPickupRequest.cartId && options.retrieveOrderByCartId) {
    try {
      resolvedOrderId = (await options.retrieveOrderByCartId(currentPickupRequest.cartId))?.id ?? null;
    } catch {
      resolvedOrderId = null;
    }
  }

  if (resolvedOrderId && currentPickupRequest.cartId && options.syncPickupRequestFromOrder) {
    try {
      const syncedPickupRequest = await options.syncPickupRequestFromOrder(
        currentPickupRequest.cartId,
        resolvedOrderId,
      );

      if (syncedPickupRequest) {
        currentPickupRequest = syncedPickupRequest;
      }
    } catch {
      // Keep original snapshot and try live cart fallback below.
    }
  }

  if (
    pickupSnapshotLooksBroken(currentPickupRequest) &&
    currentPickupRequest.cartId &&
    options.retrieveCart
  ) {
    try {
      const liveCart = await options.retrieveCart(currentPickupRequest.cartId);
      currentPickupRequest = hydratePickupRequestFromCart(currentPickupRequest, liveCart);
      recoveredFromLiveCart = true;
    } catch {
      recoveredFromLiveCart = false;
    }
  }

  return {
    pickupRequest: currentPickupRequest,
    resolvedOrderId,
    recoveredFromLiveCart,
  };
}
