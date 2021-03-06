/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Directive, Host, Input, TemplateRef, ViewContainerRef} from '@angular/core';

import {NgLocalization, getPluralCategory} from '../localization';

import {SwitchView} from './ng_switch';


/**
 * @ngModule CommonModule
 *
 * @whatItDoes Adds / removes DOM sub-trees based on a numeric value. Tailored for pluralization.
 *
 * @howToUse
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-container *ngPluralCase="'=0'">there is nothing</ng-container>
 *   <ng-container *ngPluralCase="'=1'">there is one</ng-container>
 *   <ng-container *ngPluralCase="'few'">there are a few</ng-container>
 *   <ng-container *ngPluralCase="'other'">there are exactly #</ng-container>
 * </some-element>
 * ```
 *
 * @description
 *
 * Displays DOM sub-trees that match the switch expression value, or failing that, DOM sub-trees
 * that match the switch expression's pluralization category.
 *
 * To use this directive you must provide a container element that sets the `[ngPlural]` attribute
 * to a switch expression. Inner elements with a `[ngPluralCase]` will display based on their
 * expression:
 * - if `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 *   matches the switch expression exactly,
 * - otherwise, the view will be treated as a "category match", and will only display if exact
 *   value matches aren't found and the value maps to its category for the defined locale.
 *
 * See http://cldr.unicode.org/index/cldr-spec/plural-rules
 *
 * @experimental
 */
@Directive({selector: '[ngPlural]'})
export class NgPlural {
  private _switchValue: number;
  private _activeView: SwitchView;
  private _caseViews: {[k: string]: SwitchView} = {};

  constructor(private _localization: NgLocalization) {}

  @Input()
  set ngPlural(value: number) {
    this._switchValue = value;
    this._updateView();
  }

  addCase(value: string, switchView: SwitchView): void { this._caseViews[value] = switchView; }

  private _updateView(): void {
    this._clearViews();

    const cases = Object.keys(this._caseViews);
    const key = getPluralCategory(this._switchValue, cases, this._localization);
    this._activateView(this._caseViews[key]);
  }

  private _clearViews() {
    if (this._activeView) this._activeView.destroy();
  }

  private _activateView(view: SwitchView) {
    if (view) {
      this._activeView = view;
      this._activeView.create();
    }
  }
}

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Creates a view that will be added/removed from the parent {@link NgPlural} when the
 *             given expression matches the plural expression according to CLDR rules.
 *
 * @howToUse
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-container *ngPluralCase="'=0'">...</ng-container>
 *   <ng-container *ngPluralCase="'other'">...</ng-container>
 * </some-element>
 *```
 *
 * See {@link NgPlural} for more details and example.
 *
 * @experimental
 */
@Directive({selector: '[ngPluralCase]'})
export class NgPluralCase {
  constructor(
      @Attribute('ngPluralCase') public value: string, template: TemplateRef<Object>,
      viewContainer: ViewContainerRef, @Host() ngPlural: NgPlural) {
    ngPlural.addCase(value, new SwitchView(viewContainer, template));
  }
}
